import { z } from "zod";

export const sessionReplayEventSchema = z.object({
  type: z.enum(["mousemove", "click", "scroll", "input", "navigation"]),
  x: z.number().optional(),
  y: z.number().optional(),
  scrollY: z.number().optional(),
  viewportW: z.number().int().positive().optional(),
  viewportH: z.number().int().positive().optional(),
  value: z.string().optional(),
  timestamp: z.number().int().nonnegative(),
});

export const sessionEventsPayloadSchema = z.object({
  projectId: z.string().min(1),
  sessionId: z.string().min(1),
  userId: z.string().optional(),
  page: z.string().min(1),
  deviceType: z.enum(["desktop", "tablet", "mobile"]).optional(),
  events: z.array(sessionReplayEventSchema).min(1).max(2000),
});

export const sessionListQuerySchema = z.object({
  projectId: z.string().min(1),
  page: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(40),
});

export const sessionReplayQuerySchema = z.object({
  projectId: z.string().min(1),
  page: z.string().optional(),
});

export type SessionReplayEventInput = z.infer<typeof sessionReplayEventSchema>;
export type SessionEventsPayloadInput = z.infer<typeof sessionEventsPayloadSchema>;
