// ── Shared mock data for all analytics pages ──────────────────────────────────

export const kpiCards = [
  {
    title: "Total Users",
    value: "124,832",
    change: "+12.4%",
    positive: true,
    sub: "vs last 30 days",
  },
  {
    title: "Active Sessions",
    value: "3,291",
    change: "+5.7%",
    positive: true,
    sub: "right now",
  },
  {
    title: "Conversion Rate",
    value: "4.38%",
    change: "-0.6%",
    positive: false,
    sub: "signup → active",
  },
  {
    title: "Avg. Session",
    value: "6m 42s",
    change: "+1m 12s",
    positive: true,
    sub: "per user",
  },
];

// Sparkline for KPI cards (7 data points)
export const sparklines: Record<string, number[]> = {
  "Total Users": [89000, 95000, 101000, 105000, 110000, 119000, 124832],
  "Active Sessions": [2200, 2800, 3000, 2700, 3100, 3050, 3291],
  "Conversion Rate": [5.1, 4.9, 4.7, 4.5, 4.6, 4.4, 4.38],
  "Avg. Session": [320, 340, 350, 360, 380, 395, 402],
};

// Real-time sparkline (last 60 seconds, one reading per second)
export function generateRealtimeData(length = 60): { t: number; v: number }[] {
  const base = 2800;
  return Array.from({ length }, (_, i) => ({
    t: i,
    v: Math.round(base + Math.sin(i / 5) * 120 + Math.random() * 60 - 30),
  }));
}

// Funnel data
export const funnelStages = [
  { name: "Visitors", value: 100000 },
  { name: "Signups", value: 34200 },
  { name: "Profile Complete", value: 22100 },
  { name: "First Action", value: 14800 },
  { name: "Active Users", value: 9300 },
];

// Cohort retention data (rows = cohort weeks, cols = day offsets)
export const cohortColumns = ["Day 1", "Day 7", "Day 14", "Day 30"];

export const cohortData = [
  { cohort: "Week 1 (Jan 6)", users: 1240, retention: [100, 72, 58, 41] },
  { cohort: "Week 2 (Jan 13)", users: 1080, retention: [100, 69, 54, 38] },
  { cohort: "Week 3 (Jan 20)", users: 1350, retention: [100, 75, 61, 44] },
  { cohort: "Week 4 (Jan 27)", users: 980, retention: [100, 68, 52, 36] },
  { cohort: "Week 5 (Feb 3)", users: 1420, retention: [100, 77, 63, 47] },
  { cohort: "Week 6 (Feb 10)", users: 1190, retention: [100, 71, 57, null] },
  { cohort: "Week 7 (Feb 17)", users: 1610, retention: [100, 74, null, null] },
];

// Performance data
export const apiMetrics = {
  avgResponseMs: 142,
  errorRate: 0.8,
  failedRequests: 312,
  slowEndpoints: [
    { path: "/api/reports/export", p99: 2840, status: "critical" },
    { path: "/api/analytics/cohort", p99: 1420, status: "warning" },
    { path: "/api/users/search", p99: 890, status: "warning" },
    { path: "/api/events/batch", p99: 540, status: "ok" },
    { path: "/api/auth/session", p99: 48, status: "ok" },
  ],
};

export const responseTimeSeries = [
  { time: "00:00", ms: 118 },
  { time: "02:00", ms: 124 },
  { time: "04:00", ms: 102 },
  { time: "06:00", ms: 98 },
  { time: "08:00", ms: 165 },
  { time: "10:00", ms: 188 },
  { time: "12:00", ms: 210 },
  { time: "14:00", ms: 196 },
  { time: "16:00", ms: 178 },
  { time: "18:00", ms: 142 },
  { time: "20:00", ms: 130 },
  { time: "22:00", ms: 115 },
];

export const errorRateSeries = [
  { time: "00:00", rate: 0.2 },
  { time: "02:00", rate: 0.3 },
  { time: "04:00", rate: 0.2 },
  { time: "06:00", rate: 0.4 },
  { time: "08:00", rate: 1.1 },
  { time: "10:00", rate: 0.9 },
  { time: "12:00", rate: 0.7 },
  { time: "14:00", rate: 0.8 },
  { time: "16:00", rate: 1.2 },
  { time: "18:00", rate: 0.8 },
  { time: "20:00", rate: 0.5 },
  { time: "22:00", rate: 0.3 },
];

// Insights
export const insights = [
  {
    id: 1,
    text: "User activity increased 18% this week compared to last week.",
    tag: "Growth",
    type: "positive",
  },
  {
    id: 2,
    text: "Chat feature usage is trending up — 34% more sessions than last month.",
    tag: "Feature",
    type: "positive",
  },
  {
    id: 3,
    text: "Peak traffic occurs at 9 PM. Consider scaling infrastructure during this window.",
    tag: "Performance",
    type: "neutral",
  },
  {
    id: 4,
    text: "Week 5 cohort shows highest Day-30 retention at 47%. Study their onboarding flow.",
    tag: "Retention",
    type: "positive",
  },
  {
    id: 5,
    text: "/api/reports/export has p99 latency of 2.8s — review query optimization.",
    tag: "Alert",
    type: "negative",
  },
];

// Overview page — daily active users chart (30 days)
export const dauSeries = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  users: Math.round(3000 + Math.sin(i / 3) * 400 + i * 30 + Math.random() * 200),
  sessions: Math.round(4200 + Math.sin(i / 4) * 500 + i * 40 + Math.random() * 300),
}));

// Traffic by device
export const deviceData = [
  { name: "Web", value: 62 },
  { name: "Mobile", value: 31 },
  { name: "Tablet", value: 7 },
];

// Top pages
export const topPages = [
  { path: "/dashboard", views: 48210, bounce: "18%" },
  { path: "/profile", views: 22540, bounce: "34%" },
  { path: "/settings", views: 14880, bounce: "41%" },
  { path: "/reports", views: 9120, bounce: "22%" },
  { path: "/onboarding", views: 7340, bounce: "55%" },
];
