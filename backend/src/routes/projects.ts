import { randomBytes, randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { HttpError } from "../middleware/errorHandler.js";

interface ProjectRow {
  id: string;
  name: string;
  website_url: string | null;
  api_key: string;
  created_at: string;
}

interface EventRow {
  project_id: string;
  session_id: string;
  created_at: string;
}

const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

const updateProjectSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

function isMissingProjectsTable(errorMessage: string) {
  const msg = errorMessage.toLowerCase();
  return msg.includes("public.projects") || msg.includes("table 'public.projects'") || msg.includes("table \"public.projects\"");
}

function setupMessage() {
  return "Projects table is not initialized in Supabase. Run supabase/schema.sql, then restart backend.";
}

function buildApiKey() {
  return `pk_${randomBytes(18).toString("hex")}`;
}

function computeStats(projects: ProjectRow[], events: EventRow[]) {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  return projects.map((project) => {
    const rows = events.filter((event) => event.project_id === project.id);
    const visitors = new Set(rows.map((event) => event.session_id)).size;
    const liveRows = rows.filter((event) => new Date(event.created_at) >= fiveMinutesAgo);
    const live = new Set(liveRows.map((event) => event.session_id)).size;

    return {
      ...project,
      stats: {
        pageViews: rows.length,
        visitors,
        live,
      },
    };
  });
}

export const projectsRouter = Router();

projectsRouter.get("/projects", async (_req, res, next) => {
  try {
    const { data: projects, error } = await supabaseAdmin
      .from("projects")
      .select("id,name,website_url,api_key,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingProjectsTable(error.message)) {
        res.json({
          projects: [],
          setupRequired: true,
          message: setupMessage(),
        });
        return;
      }

      throw new HttpError(500, error.message);
    }

    const projectIds = (projects ?? []).map((project) => project.id);

    let events: EventRow[] = [];

    if (projectIds.length > 0) {
      const { data: eventsData, error: eventsError } = await supabaseAdmin
        .from("interaction_events")
        .select("project_id,session_id,created_at")
        .in("project_id", projectIds)
        .limit(100000);

      if (eventsError) {
        throw new HttpError(500, eventsError.message);
      }

      events = (eventsData ?? []) as EventRow[];
    }

    res.json({
      projects: computeStats((projects ?? []) as ProjectRow[], events),
    });
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/projects", async (req, res, next) => {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid project payload");
    }

    const { name, websiteUrl } = parsed.data;

    const newProject = {
      id: randomUUID(),
      name,
      website_url: websiteUrl || null,
      api_key: buildApiKey(),
    };

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert(newProject)
      .select("id,name,website_url,api_key,created_at")
      .single();

    if (error) {
      if (isMissingProjectsTable(error.message)) {
        throw new HttpError(503, setupMessage());
      }

      throw new HttpError(500, error.message);
    }

    res.status(201).json({ project: data });
  } catch (error) {
    next(error);
  }
});

projectsRouter.patch("/projects/:id", async (req, res, next) => {
  try {
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid project update payload");
    }

    const updateBody: { name?: string; website_url?: string | null } = {};
    if (parsed.data.name !== undefined) updateBody.name = parsed.data.name;
    if (parsed.data.websiteUrl !== undefined) updateBody.website_url = parsed.data.websiteUrl || null;

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(updateBody)
      .eq("id", req.params.id)
      .select("id,name,website_url,api_key,created_at")
      .single();

    if (error) {
      if (isMissingProjectsTable(error.message)) {
        throw new HttpError(503, setupMessage());
      }

      throw new HttpError(500, error.message);
    }

    res.json({ project: data });
  } catch (error) {
    next(error);
  }
});

projectsRouter.delete("/projects/:id", async (req, res, next) => {
  try {
    const projectId = req.params.id;

    const { error: deleteEventsError } = await supabaseAdmin
      .from("interaction_events")
      .delete()
      .eq("project_id", projectId);

    if (deleteEventsError) {
      throw new HttpError(500, deleteEventsError.message);
    }

    const { error } = await supabaseAdmin.from("projects").delete().eq("id", projectId);

    if (error) {
      if (isMissingProjectsTable(error.message)) {
        throw new HttpError(503, setupMessage());
      }

      throw new HttpError(500, error.message);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
