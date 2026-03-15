import { useEffect, useRef, useCallback } from "react";
import type { HeatmapPoint } from "@/lib/heatmapData";

/* ──────────────────────────────────────────────────────────────────────────────
 * Custom Canvas 2D Heatmap Renderer
 *
 * Replaces heatmap.js which has a known bug: it tries to reassign the
 * read-only `ImageData.data` property, crashing in modern browsers.
 *
 * Algorithm:
 *   1. Draw each data point as a radial-gradient circle on an off-screen
 *      alpha-only canvas (intensity map).
 *   2. Read the alpha values back and map them through a color gradient
 *      palette (256 RGBA entries) to produce the final colored heatmap.
 * ────────────────────────────────────────────────────────────────────────── */

interface UseHeatmapOptions {
  radius?: number;
  maxOpacity?: number;
  blur?: number;
  paletteStops?: Array<{ offset: number; color: string }>;
}

/** Build a 256-entry RGBA palette (blue → cyan → green → yellow → red). */
function buildPalette(stops?: Array<{ offset: number; color: string }>): Uint8ClampedArray {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;

  const grd = ctx.createLinearGradient(0, 0, 256, 0);
  const paletteStops = stops ?? [
    { offset: 0.0, color: "#3b82f6" },
    { offset: 0.2, color: "#22d3ee" },
    { offset: 0.45, color: "#22c55e" },
    { offset: 0.7, color: "#facc15" },
    { offset: 1.0, color: "#ef4444" },
  ];

  for (const stop of paletteStops) {
    grd.addColorStop(stop.offset, stop.color);
  }

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 256, 1);

  return ctx.getImageData(0, 0, 256, 1).data;
}

const paletteCache = new Map<string, Uint8ClampedArray>();
function getPalette(stops?: Array<{ offset: number; color: string }>): Uint8ClampedArray {
  const key = JSON.stringify(stops ?? []);
  const cached = paletteCache.get(key);
  if (cached) return cached;

  const palette = buildPalette(stops);
  paletteCache.set(key, palette);
  return palette;
}

/** Render heatmap data onto a canvas element. */
function renderHeatmap(
  canvas: HTMLCanvasElement,
  data: HeatmapPoint[],
  radius: number,
  maxOpacity: number,
  blur: number,
  paletteStops?: Array<{ offset: number; color: string }>
) {
  const width = canvas.width;
  const height = canvas.height;
  if (width === 0 || height === 0) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  // Always clear first so stale heatmap pixels never linger.
  ctx.clearRect(0, 0, width, height);
  if (data.length === 0) return;

  // ── Step 1: Draw alpha (intensity) circles ──
  const maxVal = Math.max(...data.map((d) => d.value));
  if (maxVal === 0) return;

  const r = radius * (1 + blur * 0.5);

  for (const point of data) {
    const alpha = Math.min(point.value / maxVal, 1);
    const grd = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, r);
    grd.addColorStop(0, `rgba(0,0,0,${alpha})`);
    grd.addColorStop(0.5, `rgba(0,0,0,${alpha * 0.5})`);
    grd.addColorStop(1, "rgba(0,0,0,0)");

    ctx.beginPath();
    ctx.fillStyle = grd;
    ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Step 2: Colorize using the palette ──
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const palette = getPalette(paletteStops);

  for (let i = 0, len = pixels.length; i < len; i += 4) {
    const alpha = pixels[i + 3]; // use alpha as intensity index
    if (alpha === 0) continue;

    const idx = alpha * 4; // position in palette
    pixels[i] = palette[idx];       // R
    pixels[i + 1] = palette[idx + 1]; // G
    pixels[i + 2] = palette[idx + 2]; // B
    pixels[i + 3] = Math.round(alpha * maxOpacity); // final alpha
  }

  ctx.putImageData(imageData, 0, 0);
}

/* ──────────────────────────────────────────────────────────────────────────── */

export function useHeatmap(
  data: HeatmapPoint[],
  options: UseHeatmapOptions = {}
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { radius = 40, maxOpacity = 0.6, blur = 0.85, paletteStops } = options;

  // ── Create / resize canvas to match container ──
  const ensureCanvas = useCallback(() => {
    const el = containerRef.current;
    if (!el) return null;

    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w === 0 || h === 0) return null;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.style.inset = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      el.appendChild(canvas);
      canvasRef.current = canvas;
    }

    // Match canvas backing-store to CSS size
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    return canvas;
  }, []);

  // ── Draw whenever data, radius, opacity, or blur change ──
  useEffect(() => {
    const canvas = ensureCanvas();
    if (!canvas) return;

    renderHeatmap(canvas, data, radius, maxOpacity, blur, paletteStops);
  }, [data, radius, maxOpacity, blur, paletteStops, ensureCanvas]);

  // ── Handle container resizes ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const canvas = ensureCanvas();
      if (canvas && data.length > 0) {
        renderHeatmap(canvas, data, radius, maxOpacity, blur, paletteStops);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, radius, maxOpacity, blur, paletteStops, ensureCanvas]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (canvasRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(canvasRef.current);
        } catch {
          // already removed
        }
        canvasRef.current = null;
      }
    };
  }, []);

  return { containerRef };
}
