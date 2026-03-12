import { sendHeatEventBatch, type HeatEventPayload } from "@/lib/heatmapApi";
import type { HeatmapMode } from "@/lib/heatmapData";

interface TrackerOptions {
  projectId: string;
  pagePath: string;
}

let queue: HeatEventPayload[] = [];
let flushTimer: number | null = null;
let lastAttentionTs = 0;

function getDeviceType(): "desktop" | "tablet" | "mobile" {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function getSessionId() {
  const key = "trackaura-session-id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;

  const generated = crypto.randomUUID();
  sessionStorage.setItem(key, generated);
  return generated;
}

function pushEvent(mode: HeatmapMode, x: number, y: number, value = 1) {
  queue.push({
    eventType: mode,
    x,
    y,
    value,
    viewportW: window.innerWidth,
    viewportH: window.innerHeight,
    deviceType: getDeviceType(),
    createdAt: new Date().toISOString(),
  });
}

async function flush(projectId: string, pagePath: string) {
  if (!queue.length) return;
  const events = queue;
  queue = [];

  try {
    await sendHeatEventBatch({
      projectId,
      pagePath,
      sessionId: getSessionId(),
      events,
    });
  } catch (error) {
    console.error("Failed to send heatmap events", error);
    queue = [...events, ...queue].slice(0, 1000);
  }
}

export function startHeatmapTracker({ projectId, pagePath }: TrackerOptions) {
  const handleClick = (event: MouseEvent) => {
    pushEvent("click", event.clientX, event.clientY, 1);
  };

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const depth = Math.round((scrollTop / maxScroll) * 100);
    pushEvent("scroll", window.innerWidth / 2, scrollTop + window.innerHeight / 2, Math.max(1, depth));
  };

  const handleMouseMove = (event: MouseEvent) => {
    const now = Date.now();
    if (now - lastAttentionTs < 250) {
      return;
    }
    lastAttentionTs = now;
    pushEvent("attention", event.clientX, event.clientY, 1);
  };

  window.addEventListener("click", handleClick);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("mousemove", handleMouseMove, { passive: true });

  flushTimer = window.setInterval(() => {
    void flush(projectId, pagePath);
  }, 3000);

  const beforeUnload = () => {
    void flush(projectId, pagePath);
  };
  window.addEventListener("beforeunload", beforeUnload);

  return () => {
    window.removeEventListener("click", handleClick);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("beforeunload", beforeUnload);
    if (flushTimer) {
      window.clearInterval(flushTimer);
      flushTimer = null;
    }
    void flush(projectId, pagePath);
  };
}
