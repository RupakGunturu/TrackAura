import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { HttpError } from "../middleware/errorHandler.js";
import { heatmapQuerySchema } from "../validation/events.js";

interface EventRow {
  x: number;
  y: number;
  value: number;
  viewport_w: number;
  viewport_h: number;
}

interface AggregatedPoint {
  xRatio: number;
  yRatio: number;
  value: number;
}

const BINS_X = 60;
const BINS_Y = 45;

function aggregatePoints(rows: EventRow[]): AggregatedPoint[] {
  const buckets = new Map<string, number>();

  for (const row of rows) {
    if (!row.viewport_w || !row.viewport_h) {
      continue;
    }

    const nx = Math.min(Math.max(row.x / row.viewport_w, 0), 0.9999);
    const ny = Math.min(Math.max(row.y / row.viewport_h, 0), 0.9999);

    const gx = Math.floor(nx * BINS_X);
    const gy = Math.floor(ny * BINS_Y);
    const key = `${gx}:${gy}`;
    buckets.set(key, (buckets.get(key) ?? 0) + (row.value || 1));
  }

  const points: AggregatedPoint[] = [];
  for (const [key, value] of buckets.entries()) {
    const [gx, gy] = key.split(":").map(Number);
    points.push({
      xRatio: (gx + 0.5) / BINS_X,
      yRatio: (gy + 0.5) / BINS_Y,
      value,
    });
  }

  return points;
}

export const heatmapRouter = Router();

heatmapRouter.get("/heatmap", async (req, res, next) => {
  try {
    const parsed = heatmapQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid heatmap query params");
    }

    const { projectId, pagePath, mode, start, end, deviceType, limit } = parsed.data;

    let query = supabaseAdmin
      .from("interaction_events")
      .select("x,y,value,viewport_w,viewport_h", { count: "exact" })
      .eq("project_id", projectId)
      .eq("page_path", pagePath)
      .eq("event_type", mode)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (start) query = query.gte("created_at", start);
    if (end) query = query.lte("created_at", end);
    if (deviceType) query = query.eq("device_type", deviceType);

    const { data, error, count } = await query;
    if (error) {
      throw new HttpError(500, error.message);
    }

    const points = aggregatePoints((data ?? []) as EventRow[]);

    res.json({
      mode,
      totalRows: count ?? 0,
      points,
    });
  } catch (error) {
    next(error);
  }
});
