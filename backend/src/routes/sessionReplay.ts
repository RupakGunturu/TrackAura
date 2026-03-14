import { Router } from "express";
import { HttpError } from "../middleware/errorHandler.js";
import { getSessionsCollection } from "../lib/mongo.js";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import {
  sessionEventsPayloadSchema,
  sessionListQuerySchema,
  sessionReplayQuerySchema,
} from "../validation/sessionReplay.js";

interface StoredReplayEvent {
  type: "mousemove" | "click" | "scroll" | "input" | "navigation";
  x?: number;
  y?: number;
  scrollY?: number;
  viewportW?: number;
  viewportH?: number;
  value?: string;
  timestamp: number;
}

interface InteractionEventRow {
  session_id: string;
  page_path: string;
  event_type: "click" | "scroll" | "attention";
  x: number;
  y: number;
  value: number;
  device_type: "desktop" | "tablet" | "mobile";
  created_at: string;
}

export const sessionReplayRouter = Router();

async function loadInteractionRows(projectId: string, page?: string) {
  let query = supabaseAdmin
    .from("interaction_events")
    .select("session_id,page_path,event_type,x,y,value,device_type,created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(20000);

  if (page) {
    query = query.eq("page_path", page);
  }

  const { data, error } = await query;
  if (error) {
    throw new HttpError(500, `Failed to load fallback replay data: ${error.message}`);
  }

  return (data ?? []) as InteractionEventRow[];
}

sessionReplayRouter.post("/session-events", async (req, res, next) => {
  try {
    console.log("[session-events] Incoming payload", {
      projectId: req.body?.projectId,
      page: req.body?.page,
      sessionId: req.body?.sessionId,
      eventsCount: Array.isArray(req.body?.events) ? req.body.events.length : 0,
    });

    const parsed = sessionEventsPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      console.warn("[session-events] Validation failed", parsed.error.flatten());
      throw new HttpError(400, "Invalid session replay payload");
    }

    const { projectId, sessionId, userId, page, events, deviceType } = parsed.data;
    const collection = await getSessionsCollection();

    const updateResult = await (collection as any).updateOne(
      { projectId, sessionId, page },
      {
        $setOnInsert: {
          projectId,
          sessionId,
          page,
          createdAt: new Date(),
        },
        $set: {
          updatedAt: new Date(),
          userId: userId ?? null,
          deviceType: deviceType ?? null,
        },
        $push: {
          events: {
            $each: events,
          },
        },
      },
      { upsert: true }
    );

    console.log("[session-events] Mongo upsert completed", {
      projectId,
      page,
      sessionId,
      matched: updateResult?.matchedCount ?? 0,
      modified: updateResult?.modifiedCount ?? 0,
      upserted: updateResult?.upsertedCount ?? 0,
    });

    // Bridge replay events into interaction_events so realtime/heatmaps update from integrated projects.
    const interactionRows = events
      .filter((event) => event.type === "mousemove" || event.type === "click" || event.type === "scroll")
      .map((event) => ({
        project_id: projectId,
        session_id: sessionId,
        page_path: page,
        event_type: event.type === "mousemove" ? "attention" : event.type,
        x: Math.max(0, Math.round(event.x ?? 0)),
        y: Math.max(0, Math.round(event.type === "scroll" ? event.scrollY ?? 0 : event.y ?? 0)),
        value: Math.max(1, Math.round(event.type === "scroll" ? event.scrollY ?? 1 : 1)),
        viewport_w: Math.max(1, Math.round(event.viewportW ?? 1366)),
        viewport_h: Math.max(1, Math.round(event.viewportH ?? 768)),
        device_type: deviceType ?? "desktop",
        created_at: new Date(event.timestamp).toISOString(),
      }));

    if (interactionRows.length > 0) {
      const { error: insertError } = await supabaseAdmin.from("interaction_events").insert(interactionRows);
      if (insertError) {
        console.error("[session-events] Bridge insert failed", {
          message: insertError.message,
          code: insertError.code,
          hint: insertError.hint,
          projectId,
          page,
          sessionId,
          bridgedRows: interactionRows.length,
        });
        throw new HttpError(500, `Failed to bridge replay events: ${insertError.message}`);
      }
    }

    console.log("[session-events] Stored + bridged", {
      projectId,
      page,
      sessionId,
      insertedEvents: events.length,
      bridgedRows: interactionRows.length,
    });

    res.status(201).json({ inserted: events.length, bridged: interactionRows.length });
  } catch (error) {
    next(error);
  }
});

sessionReplayRouter.get("/session-replay/sessions", async (req, res, next) => {
  try {
    const parsed = sessionListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid session replay query params");
    }

    const { projectId, limit, page, search } = parsed.data;
    const collection = await getSessionsCollection();

    const pipeline = [
      {
        $match: {
          projectId,
          ...(page ? { page } : {}),
          ...(search
            ? {
                sessionId: { $regex: search, $options: "i" },
              }
            : {}),
        },
      },
      {
        $project: {
          sessionId: 1,
          page: 1,
          deviceType: { $ifNull: ["$deviceType", "desktop"] },
          eventCount: { $size: { $ifNull: ["$events", []] } },
          firstTs: { $min: "$events.timestamp" },
          lastTs: { $max: "$events.timestamp" },
          createdAt: 1,
        },
      },
      {
        $sort: {
          lastTs: -1,
          createdAt: -1,
        },
      },
      {
        $limit: limit,
      },
    ];

    const docs = await collection.aggregate(pipeline).toArray();

    let sessions = docs.map((doc) => {
      const firstTs = Number(doc.firstTs ?? 0);
      const lastTs = Number(doc.lastTs ?? firstTs);
      const durationSec = Math.max(0, Math.round((lastTs - firstTs) / 1000));

      return {
        sessionId: String(doc.sessionId),
        page: String(doc.page ?? "/"),
        durationSec,
        eventCount: Number(doc.eventCount ?? 0),
        deviceType: String(doc.deviceType ?? "desktop"),
        startedAt: firstTs > 0 ? new Date(firstTs).toISOString() : new Date(doc.createdAt ?? Date.now()).toISOString(),
      };
    });

    if (sessions.length === 0) {
      const fallbackRows = await loadInteractionRows(projectId, page);

      const grouped = new Map<string, InteractionEventRow[]>();
      for (const row of fallbackRows) {
        if (search && !row.session_id.toLowerCase().includes(search.toLowerCase())) {
          continue;
        }
        if (!grouped.has(row.session_id)) {
          grouped.set(row.session_id, []);
        }
        grouped.get(row.session_id)?.push(row);
      }

      sessions = [...grouped.entries()]
        .map(([sessionId, rows]) => {
          const sorted = [...rows].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
          const first = sorted[0];
          const last = sorted[sorted.length - 1];
          return {
            sessionId,
            page: first?.page_path ?? "/",
            durationSec: Math.max(0, Math.round((+new Date(last.created_at) - +new Date(first.created_at)) / 1000)),
            eventCount: sorted.length,
            deviceType: first?.device_type ?? "desktop",
            startedAt: first?.created_at ?? new Date().toISOString(),
          };
        })
        .sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt))
        .slice(0, limit);
    }

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

sessionReplayRouter.get("/session-replay/:sessionId", async (req, res, next) => {
  try {
    const parsed = sessionReplayQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid replay query params");
    }

    const { sessionId } = req.params;
    if (!sessionId) {
      throw new HttpError(400, "Session id is required");
    }

    const collection = await getSessionsCollection();
    const docs = await collection
      .find({
        projectId: parsed.data.projectId,
        sessionId,
        ...(parsed.data.page ? { page: parsed.data.page } : {}),
      })
      .toArray();

    if (docs.length > 0) {
      const basePage = String(docs[0].page ?? "/");
      const deviceType = String(docs[0].deviceType ?? "desktop");

      const events = docs
        .flatMap((doc) => (Array.isArray(doc.events) ? (doc.events as StoredReplayEvent[]) : []))
        .sort((a, b) => a.timestamp - b.timestamp);

      const startTs = events[0]?.timestamp ?? Date.now();
      const endTs = events[events.length - 1]?.timestamp ?? startTs;

      res.json({
        sessionId,
        page: basePage,
        deviceType,
        durationMs: Math.max(0, endTs - startTs),
        events,
      });
      return;
    }

    const fallbackRows = await loadInteractionRows(parsed.data.projectId, parsed.data.page);
    const rows = fallbackRows
      .filter((row) => row.session_id === sessionId)
      .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));

    if (rows.length === 0) {
      res.status(404).json({ message: "Session replay not found" });
      return;
    }

    const basePage = rows[0].page_path;
    const deviceType = rows[0].device_type;

    const events: StoredReplayEvent[] = rows.map((row) => ({
      type: row.event_type === "attention" ? "mousemove" : row.event_type,
      x: row.x,
      y: row.y,
      scrollY: row.event_type === "scroll" ? row.y : undefined,
      value: row.event_type === "scroll" ? String(row.value) : undefined,
      timestamp: +new Date(row.created_at),
    }));

    const startTs = events[0]?.timestamp ?? Date.now();
    const endTs = events[events.length - 1]?.timestamp ?? startTs;

    res.json({
      sessionId,
      page: basePage,
      deviceType,
      durationMs: Math.max(0, endTs - startTs),
      events,
    });
  } catch (error) {
    next(error);
  }
});
