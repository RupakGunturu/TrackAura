import { z } from "zod";

export const heatmapModeSchema = z.enum(["click", "scroll", "attention"]);

export const eventPayloadSchema = z.object({
  eventType: heatmapModeSchema,
  x: z.number().min(0),
  y: z.number().min(0),
  value: z.number().int().positive().default(1),
  viewportW: z.number().int().positive(),
  viewportH: z.number().int().positive(),
  deviceType: z.enum(["desktop", "tablet", "mobile"]).default("desktop"),
  createdAt: z.string().datetime().optional(),
});

export const eventsBatchSchema = z.object({
  projectId: z.string().min(1),
  pagePath: z.string().min(1),
  sessionId: z.string().min(1),
  events: z.array(eventPayloadSchema).min(1).max(1000),
});

export const heatmapQuerySchema = z.object({
  projectId: z.string().min(1),
  pagePath: z.string().min(1),
  mode: heatmapModeSchema,
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  deviceType: z.enum(["desktop", "tablet", "mobile"]).optional(),
  limit: z.coerce.number().int().min(100).max(20000).default(5000),
});

export const analyticsQuerySchema = z.object({
  projectIds: z.string().min(1),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  deviceType: z.enum(["desktop", "tablet", "mobile"]).optional(),
  userType: z.enum(["free", "pro", "enterprise"]).optional(),
  pagePath: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type EventsBatchInput = z.infer<typeof eventsBatchSchema>;
export type HeatmapQueryInput = z.infer<typeof heatmapQuerySchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
