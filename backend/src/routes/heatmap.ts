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

interface RepresentativeViewport {
  width: number;
  height: number;
}

const BINS_X = 60;
const BINS_Y = 45;

function aggregatePoints(rows: EventRow[], mode: "click" | "scroll" | "attention"): AggregatedPoint[] {
  const buckets = new Map<string, number>();

  for (const row of rows) {
    if (!row.viewport_w || !row.viewport_h) {
      continue;
    }

    const nx = mode === "scroll"
      ? 0.5
      : Math.min(Math.max(row.x / row.viewport_w, 0), 0.9999);

    // Scroll events store normalized depth in `value` (0-100).
    // Falling back to `y / viewport_h` keeps older rows usable.
    const scrollDepthRatio = Math.min(Math.max((row.value || 0) / 100, 0), 0.9999);
    const ny = mode === "scroll"
      ? (scrollDepthRatio > 0 ? scrollDepthRatio : Math.min(Math.max(row.y / row.viewport_h, 0), 0.9999))
      : Math.min(Math.max(row.y / row.viewport_h, 0), 0.9999);

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

function getRepresentativeViewport(rows: EventRow[]): RepresentativeViewport | null {
  const validRows = rows.filter((row) => row.viewport_w > 0 && row.viewport_h > 0);
  if (!validRows.length) return null;

  const avgW = Math.round(validRows.reduce((sum, row) => sum + row.viewport_w, 0) / validRows.length);
  const avgH = Math.round(validRows.reduce((sum, row) => sum + row.viewport_h, 0) / validRows.length);

  return {
    width: Math.max(1, avgW),
    height: Math.max(1, avgH),
  };
}

export const heatmapRouter = Router();

heatmapRouter.get("/heatmap", async (req, res, next) => {
  try {
    const parsed = heatmapQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      console.warn("[heatmap] Invalid query params", {
        query: req.query,
        issues: parsed.error.flatten(),
      });
      throw new HttpError(400, "Invalid heatmap query params");
    }

    const { projectId, pagePath, mode, start, end, deviceType, limit } = parsed.data;

    console.log("[heatmap] Query received", {
      projectId,
      pagePath: pagePath ?? "ALL",
      mode,
      start: start ?? null,
      end: end ?? null,
      deviceType: deviceType ?? "ALL",
      limit,
    });

    let query = supabaseAdmin
      .from("interaction_events")
      .select("x,y,value,viewport_w,viewport_h", { count: "exact" })
      .eq("project_id", projectId)
      .eq("event_type", mode)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (pagePath) query = query.eq("page_path", pagePath);
    if (start) query = query.gte("created_at", start);
    if (end) query = query.lte("created_at", end);
    if (deviceType) query = query.eq("device_type", deviceType);

    const { data, error, count } = await query;
    if (error) {
      console.error("[heatmap] Supabase query failed", {
        message: error.message,
        code: error.code,
        hint: error.hint,
        projectId,
        pagePath: pagePath ?? "ALL",
        mode,
      });
      throw new HttpError(500, error.message);
    }

    const rows = (data ?? []) as EventRow[];
    const points = aggregatePoints(rows, mode);
    const viewport = getRepresentativeViewport(rows);

    console.log("[heatmap] Query result", {
      projectId,
      pagePath: pagePath ?? "ALL",
      mode,
      totalRows: count ?? 0,
      points: points.length,
    });

    res.json({
      mode,
      totalRows: count ?? 0,
      points,
      viewport,
    });
  } catch (error) {
    next(error);
  }
});
