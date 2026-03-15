import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Expand, Minimize, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { SessionReplayEvent } from "@/lib/sessionReplayApi";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatMs(durationMs: number) {
  const totalSec = Math.floor(durationMs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = String(totalSec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function SessionReplayViewer({
  events,
  durationMs,
  page,
  previewUrl,
}: {
  events: SessionReplayEvent[];
  durationMs: number;
  page: string;
  previewUrl?: string | null;
}) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progressMs, setProgressMs] = useState(0);
  const [cursor, setCursor] = useState({ xRatio: 0.12, yRatio: 0.12, clickPulse: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const startTs = events[0]?.timestamp ?? 0;

  const visibleEvents = useMemo(() => {
    if (!events.length) return [];
    return events.filter((event) => event.timestamp - startTs <= progressMs);
  }, [events, progressMs, startTs]);

  useEffect(() => {
    const lastEvent = visibleEvents[visibleEvents.length - 1];
    if (!lastEvent) return;

    const viewportW = Math.max(1, Math.round(lastEvent.viewportW ?? 1366));
    const viewportH = Math.max(1, Math.round(lastEvent.viewportH ?? 768));

    if (typeof lastEvent.x === "number" && typeof lastEvent.y === "number") {
      setCursor((prev) => ({
        ...prev,
        xRatio: clamp(lastEvent.x / viewportW, 0, 1),
        yRatio: clamp(lastEvent.y / viewportH, 0, 1),
      }));
    }

    if (lastEvent.type === "click") {
      setCursor((prev) => ({ ...prev, clickPulse: Date.now() }));
    }

    if (lastEvent.type === "scroll" && typeof lastEvent.scrollY === "number") {
      setScrollProgress(clamp(lastEvent.scrollY / (viewportH * 4), 0, 1));
    }

    if (lastEvent.type === "input" && typeof lastEvent.value === "string") {
      setInputValue(lastEvent.value);
    }
  }, [visibleEvents]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const tick = (time: number) => {
      if (!lastTickRef.current) {
        lastTickRef.current = time;
      }
      const delta = time - lastTickRef.current;
      lastTickRef.current = time;

      setProgressMs((prev) => {
        const next = prev + delta * speed;
        if (next >= durationMs) {
          setPlaying(false);
          return durationMs;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = 0;
    };
  }, [playing, speed, durationMs]);

  const progressPct = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  const eventStats = useMemo(() => {
    const stats = {
      click: 0,
      scroll: 0,
      attention: 0,
    };

    for (const event of visibleEvents) {
      if (event.type === "click") stats.click += 1;
      if (event.type === "scroll") stats.scroll += 1;
      if (event.type === "mousemove") stats.attention += 1;
    }

    return stats;
  }, [visibleEvents]);

  const toggleFullscreen = async () => {
    const target = stageRef.current;
    if (!target) return;

    if (!document.fullscreenElement) {
      await target.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  };

  const resolvedPreviewUrl = useMemo(() => {
    if (!previewUrl) return null;
    if (page.startsWith("http://") || page.startsWith("https://")) return page;

    try {
      const base = new URL(previewUrl);
      if (page.startsWith("/")) {
        return `${base.origin}${page}`;
      }
      return `${base.origin}/${page}`;
    } catch {
      return previewUrl;
    }
  }, [previewUrl, page]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Session Replay Viewer</h3>
          <p className="text-xs text-gray-600 mt-0.5">Page: {page}</p>
        </div>
        <div className="text-xs text-gray-600">{formatMs(Math.round(progressMs))} / {formatMs(durationMs)}</div>
      </div>

      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setProgressMs((prev) => clamp(prev - 5000, 0, durationMs))}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button size="icon" className="h-9 w-9 rounded-full bg-green-600 hover:bg-green-700" onClick={() => setPlaying((prev) => !prev)}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setProgressMs((prev) => clamp(prev + 5000, 0, durationMs))}>
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="flex-1 px-2">
            <Slider
              value={[progressPct]}
              onValueChange={(value) => setProgressMs(Math.round((value[0] / 100) * durationMs))}
              max={100}
              step={0.1}
            />
          </div>

          <select
            value={String(speed)}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
            <option value="3">3x</option>
          </select>

          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => void toggleFullscreen()}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">Clicks: {eventStats.click}</span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">Scrolls: {eventStats.scroll}</span>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-700">Attention: {eventStats.attention}</span>
        </div>
      </div>

      <div className="p-4" ref={stageRef}>
        <div className="relative h-[72vh] min-h-[520px] rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-10 border-b border-gray-200 bg-gray-50 px-3 text-xs text-gray-500 flex items-center justify-between">
            <span>{page}</span>
            <span>Scroll progress: {Math.round(scrollProgress * 100)}%</span>
          </div>

          <div className="absolute left-0 right-0 top-10 bottom-0 overflow-hidden">
            {resolvedPreviewUrl ? (
              <motion.div
                className="absolute inset-0"
                animate={{ y: clamp(-scrollProgress * 260, -260, 0) }}
                transition={{ type: "tween", duration: 0.2 }}
              >
                <iframe
                  src={resolvedPreviewUrl}
                  title="Session replay preview"
                  className="h-full w-full"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </motion.div>
            ) : (
              <motion.div
                className="absolute left-4 right-4 top-4 rounded-lg border border-gray-200 bg-gray-50 p-3"
                animate={{ y: clamp(-scrollProgress * 220, -220, 0) }}
                transition={{ type: "tween", duration: 0.2 }}
              >
                <div className="h-5 w-32 rounded bg-gray-200" />
                <div className="mt-3 h-3 w-full rounded bg-gray-200" />
                <div className="mt-2 h-3 w-4/5 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-3/5 rounded bg-gray-200" />

                <div className="mt-5 rounded-md border border-gray-300 bg-white p-2 text-xs text-gray-700">
                  {inputValue || "Input playback will appear here"}
                </div>
              </motion.div>
            )}

            <motion.div
              className="absolute z-20"
              animate={{ x: `${cursor.xRatio * 100}%`, y: `${cursor.yRatio * 100}%` }}
              transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.6 }}
            >
              <div className="relative">
                <div className="h-3.5 w-3.5 rounded-full bg-green-600 border-2 border-white shadow" />
                {cursor.clickPulse > 0 && (
                  <motion.div
                    key={cursor.clickPulse}
                    className="absolute -inset-2 rounded-full border-2 border-green-500"
                    initial={{ opacity: 0.7, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 1.8 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
