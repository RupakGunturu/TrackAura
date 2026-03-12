import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { HttpError } from "../middleware/errorHandler.js";
import { eventsBatchSchema } from "../validation/events.js";

export const eventsRouter = Router();

eventsRouter.post("/events/batch", async (req, res, next) => {
  try {
    const parsed = eventsBatchSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid events payload");
    }

    const { projectId, pagePath, sessionId, events } = parsed.data;
    const rows = events.map((event) => ({
      project_id: projectId,
      session_id: sessionId,
      page_path: pagePath,
      event_type: event.eventType,
      x: Math.round(event.x),
      y: Math.round(event.y),
      value: event.value,
      viewport_w: event.viewportW,
      viewport_h: event.viewportH,
      device_type: event.deviceType,
      created_at: event.createdAt ?? new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin.from("interaction_events").insert(rows);
    if (error) {
      throw new HttpError(500, error.message);
    }

    res.status(201).json({ inserted: rows.length });
  } catch (error) {
    next(error);
  }
});
