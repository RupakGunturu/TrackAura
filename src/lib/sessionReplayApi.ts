import { apiGet, apiPost } from "@/lib/apiClient";

export interface SessionReplayEvent {
  type: "mousemove" | "click" | "scroll" | "input" | "navigation";
  x?: number;
  y?: number;
  scrollY?: number;
  viewportW?: number;
  viewportH?: number;
  value?: string;
  timestamp: number;
}

export interface SessionEventsPayload {
  projectId: string;
  sessionId: string;
  userId?: string;
  page: string;
  deviceType?: "desktop" | "tablet" | "mobile";
  events: SessionReplayEvent[];
}

export interface SessionListItem {
  sessionId: string;
  page: string;
  durationSec: number;
  eventCount: number;
  deviceType: "desktop" | "tablet" | "mobile";
  startedAt: string;
}

export interface SessionListResponse {
  sessions: SessionListItem[];
}

export interface SessionReplayResponse {
  sessionId: string;
  page: string;
  deviceType: "desktop" | "tablet" | "mobile";
  durationMs: number;
  events: SessionReplayEvent[];
}

export function postSessionEvents(payload: SessionEventsPayload) {
  return apiPost<SessionEventsPayload, { inserted: number }>("/api/session-events", payload);
}

export function fetchSessionList(query: { projectId: string; search?: string; page?: string; limit?: number }) {
  return apiGet<SessionListResponse>("/api/session-replay/sessions", query);
}

export function fetchSessionReplay(sessionId: string, query: { projectId: string; page?: string }) {
  return apiGet<SessionReplayResponse>(`/api/session-replay/${sessionId}`, query);
}
