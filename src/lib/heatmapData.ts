// ── Heatmap Analytics Mock Data ──────────────────────────────────────────────

export interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
}

export interface ClickedElement {
  id: number;
  name: string;
  selector: string;
  clicks: number;
  percent: number;
  trend: "up" | "down" | "flat";
  trendValue: string;
}

export interface HeatmapInsights {
  totalClicks: number;
  rageClicks: number;
  deadClicks: number;
  avgScrollDepth: number;
  mostClickedElement: string;
  uniqueVisitors: number;
  avgTimeOnPage: string;
}

export type HeatmapMode = "click" | "scroll" | "attention";

// Generate realistic click heatmap data
function generateClickData(width: number, height: number): HeatmapPoint[] {
  const hotspots = [
    { cx: 0.15, cy: 0.06, spread: 0.04, maxVal: 85 },  // Nav area
    { cx: 0.35, cy: 0.06, spread: 0.03, maxVal: 70 },  // Nav link
    { cx: 0.55, cy: 0.06, spread: 0.03, maxVal: 60 },  // Nav link
    { cx: 0.85, cy: 0.06, spread: 0.04, maxVal: 90 },  // CTA nav
    { cx: 0.40, cy: 0.30, spread: 0.08, maxVal: 100 }, // Hero CTA
    { cx: 0.60, cy: 0.30, spread: 0.06, maxVal: 75 },  // Secondary CTA
    { cx: 0.25, cy: 0.55, spread: 0.07, maxVal: 65 },  // Feature card 1
    { cx: 0.50, cy: 0.55, spread: 0.07, maxVal: 55 },  // Feature card 2
    { cx: 0.75, cy: 0.55, spread: 0.06, maxVal: 50 },  // Feature card 3
    { cx: 0.50, cy: 0.78, spread: 0.09, maxVal: 80 },  // Bottom CTA
    { cx: 0.30, cy: 0.92, spread: 0.05, maxVal: 35 },  // Footer
    { cx: 0.70, cy: 0.92, spread: 0.05, maxVal: 30 },  // Footer
  ];

  const points: HeatmapPoint[] = [];

  for (const spot of hotspots) {
    const count = Math.floor(15 + Math.random() * 30);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * spot.spread;
      const x = Math.round((spot.cx + Math.cos(angle) * dist) * width);
      const y = Math.round((spot.cy + Math.sin(angle) * dist) * height);
      const value = Math.max(1, Math.round(spot.maxVal * (1 - dist / spot.spread) * (0.6 + Math.random() * 0.4)));
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        points.push({ x, y, value });
      }
    }
  }

  // Scatter noise
  for (let i = 0; i < 40; i++) {
    points.push({
      x: Math.round(Math.random() * width),
      y: Math.round(Math.random() * height),
      value: Math.round(1 + Math.random() * 10),
    });
  }

  return points;
}

// Generate scroll depth data (horizontal bands)
function generateScrollData(width: number, height: number): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];
  const rows = 60;
  const cols = 30;

  for (let row = 0; row < rows; row++) {
    const depthFactor = 1 - (row / rows) * 0.85; // More intensity at top
    for (let col = 0; col < cols; col++) {
      const x = Math.round((col / cols) * width);
      const y = Math.round((row / rows) * height);
      const value = Math.max(
        1,
        Math.round(depthFactor * 80 * (0.7 + Math.random() * 0.3))
      );
      points.push({ x, y, value });
    }
  }

  return points;
}

// Generate attention/engagement data
function generateAttentionData(width: number, height: number): HeatmapPoint[] {
  const zones = [
    { cx: 0.50, cy: 0.15, spread: 0.15, maxVal: 90 },  // Hero area
    { cx: 0.50, cy: 0.35, spread: 0.20, maxVal: 100 },  // Main content
    { cx: 0.50, cy: 0.55, spread: 0.18, maxVal: 70 },   // Features
    { cx: 0.50, cy: 0.75, spread: 0.12, maxVal: 50 },   // Lower content
    { cx: 0.50, cy: 0.90, spread: 0.10, maxVal: 25 },   // Footer
  ];

  const points: HeatmapPoint[] = [];

  for (const zone of zones) {
    const count = Math.floor(40 + Math.random() * 30);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * zone.spread;
      const x = Math.round((zone.cx + Math.cos(angle) * dist) * width);
      const y = Math.round((zone.cy + Math.sin(angle) * dist) * height);
      const value = Math.max(1, Math.round(zone.maxVal * (1 - dist / zone.spread) * (0.5 + Math.random() * 0.5)));
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        points.push({ x, y, value });
      }
    }
  }

  return points;
}

// Pre-generate data at a reference size and store as ratios
const REF_WIDTH = 1200;
const REF_HEIGHT = 900;

export const heatmapDataSets: Record<HeatmapMode, HeatmapPoint[]> = {
  click: generateClickData(REF_WIDTH, REF_HEIGHT),
  scroll: generateScrollData(REF_WIDTH, REF_HEIGHT),
  attention: generateAttentionData(REF_WIDTH, REF_HEIGHT),
};

export function getScaledData(
  mode: HeatmapMode,
  containerWidth: number,
  containerHeight: number
): HeatmapPoint[] {
  const raw = heatmapDataSets[mode];
  const scaleX = containerWidth / REF_WIDTH;
  const scaleY = containerHeight / REF_HEIGHT;

  return raw.map((p) => ({
    x: Math.round(p.x * scaleX),
    y: Math.round(p.y * scaleY),
    value: p.value,
  }));
}

export const heatmapInsights: HeatmapInsights = {
  totalClicks: 14832,
  rageClicks: 243,
  deadClicks: 587,
  avgScrollDepth: 68,
  mostClickedElement: "Get Started Button",
  uniqueVisitors: 8421,
  avgTimeOnPage: "2m 34s",
};

export const topClickedElements: ClickedElement[] = [
  {
    id: 1,
    name: "Get Started Button",
    selector: "#hero-cta",
    clicks: 3842,
    percent: 100,
    trend: "up",
    trendValue: "+12.4%",
  },
  {
    id: 2,
    name: "Sign In Link",
    selector: ".nav-signin",
    clicks: 2918,
    percent: 76,
    trend: "up",
    trendValue: "+5.2%",
  },
  {
    id: 3,
    name: "Pricing Tab",
    selector: ".nav-pricing",
    clicks: 2156,
    percent: 56,
    trend: "down",
    trendValue: "-3.1%",
  },
  {
    id: 4,
    name: "Feature Card #1",
    selector: ".feature-card-1",
    clicks: 1647,
    percent: 43,
    trend: "up",
    trendValue: "+8.7%",
  },
  {
    id: 5,
    name: "Bottom CTA",
    selector: ".bottom-cta",
    clicks: 1423,
    percent: 37,
    trend: "flat",
    trendValue: "+0.3%",
  },
  {
    id: 6,
    name: "Feature Card #2",
    selector: ".feature-card-2",
    clicks: 1198,
    percent: 31,
    trend: "down",
    trendValue: "-1.8%",
  },
  {
    id: 7,
    name: "Footer Links",
    selector: ".footer a",
    clicks: 876,
    percent: 23,
    trend: "down",
    trendValue: "-4.5%",
  },
  {
    id: 8,
    name: "Logo / Home",
    selector: ".brand-logo",
    clicks: 654,
    percent: 17,
    trend: "up",
    trendValue: "+2.1%",
  },
];
