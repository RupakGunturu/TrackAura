# TrackAura Analytics Implementation Guide

> **Complete guide for implementing the analytics dashboard on your own projects**

## Quick Start (5 minutes)

To add the analytics dashboard to another project:

### 1. Install Dependencies
```bash
npm install recharts @tanstack/react-query lucide-react @radix-ui/themes
```

### 2. Copy Analytics API Client
Create `src/lib/analyticsApi.ts` with these TypeScript interfaces and fetch functions:

```typescript
import { apiGet } from "@/lib/apiClient";

export interface AnalyticsQuery {
  projectIds: string;
  start?: string;
  end?: string;
  device?: "All Devices" | "Web" | "Mobile" | "Tablet";
  userType?: "free" | "pro" | "enterprise" | "All Users";
}

export interface RealtimeAnalyticsResponse {
  projectIds: string[];
  onlineUsers: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
  data: Array<{ t: number; v: number }>;
  regions: Array<{ name: string; users: number; pct: number }>;
  pages: Array<{ path: string; events: number }>;
}

export interface FunnelsAnalyticsResponse {
  projectIds: string[];
  stages: Array<{ name: string; value: number }>;
  totals: {
    visitors: number;
    converted: number;
    conversionRate: number;
  };
}

export interface RetentionAnalyticsResponse {
  projectIds: string[];
  cohortColumns: string[];
  cohortData: Array<{
    cohort: string;
    users: number;
    retention: Array<number | null>;
  }>;
}

export interface PerformanceAnalyticsResponse {
  projectIds: string[];
  apiMetrics: {
    avgResponseMs: number;
    errorRate: number;
    failedRequests: number;
    slowEndpoints: Array<{
      path: string;
      p99: number;
      status: "ok" | "warning" | "critical";
    }>;
  };
  responseTimeSeries: Array<{ time: string; ms: number }>;
  errorRateSeries: Array<{ time: string; rate: number }>;
}

function mapDevice(device?: string) {
  if (!device || device === "All Devices") return undefined;
  if (device === "Web") return "desktop";
  if (device === "Mobile") return "mobile";
  return "tablet";
}

function toParams(query: AnalyticsQuery) {
  return {
    projectIds: query.projectIds,
    start: query.start,
    end: query.end,
    deviceType: mapDevice(query.device),
    userType: query.userType?.toLowerCase().replace(" users", ""),
  };
}

export function fetchRealtimeAnalytics(query: AnalyticsQuery) {
  return apiGet<RealtimeAnalyticsResponse>("/api/analytics/realtime", toParams(query));
}

export function fetchFunnelAnalytics(query: AnalyticsQuery) {
  return apiGet<FunnelsAnalyticsResponse>("/api/analytics/funnels", toParams(query));
}

export function fetchRetentionAnalytics(query: AnalyticsQuery) {
  return apiGet<RetentionAnalyticsResponse>("/api/analytics/retention", toParams(query));
}

export function fetchPerformanceAnalytics(query: AnalyticsQuery) {
  return apiGet<PerformanceAnalyticsResponse>("/api/analytics/performance", toParams(query));
}
```

### 3. Copy Backend Analytics Route
Replace your `backend/src/routes/analytics.ts` with TrackAura's version from `backend/src/routes/analytics.ts`.

Ensure your backend wires it up:
```typescript
// backend/src/server.ts
import { analyticsRouter } from "./routes/analytics.js";
app.use("/api", analyticsRouter);
```

### 4. Ensure Supabase Table Exists
```sql
CREATE TABLE IF NOT EXISTS interaction_events (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'click', 'scroll', 'attention'
  value INT DEFAULT 0,
  device_type TEXT NOT NULL, -- 'desktop', 'mobile', 'tablet'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_project ON interaction_events(project_id);
CREATE INDEX idx_events_session ON interaction_events(session_id);
CREATE INDEX idx_events_created ON interaction_events(created_at);
```

### 5. Copy Analytics Pages
Copy these pages from TrackAura:
- `src/pages/RealTimePage.tsx` - Live user dashboard
- `src/pages/FunnelsPage.tsx` - Conversion funnel
- `src/pages/RetentionPage.tsx` - Cohort retention
- `src/pages/PerformancePage.tsx` - API health

Update colors in each:
```typescript
// Replace all:
bg-blue-600 → bg-green-600
text-blue-600 → text-green-600
from-blue-600 to-blue-700 → from-green-600 to-green-700
#3b82f6 → #10b981
```

### 6. Setup React Query
```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
  document.getElementById("root")
);
```

## Color Scheme Reference

All analytics pages use this green color palette:

```css
/* Primary Color */
Primary: hsl(158, 64%, 35%) /* #10b981 */
Primary-50: hsl(158, 84%, 90%)
Primary-600: hsl(158, 64%, 35%)
Primary-700: hsl(158, 70%, 25%)

/* Status Colors */
Success: hsl(158, 64%, 35%)  /* Green */
Warning: hsl(38, 92%, 50%)   /* Amber */
Error: hsl(0, 84%, 60%)      /* Red */
```

## API Key Generation Pattern

For secure API keys in your project:

```typescript
import { randomBytes } from "crypto";

function generateSecureApiKey(): string {
  const prefix = "pk_";
  const randomPart = randomBytes(18).toString("hex"); // 36 hex chars
  return prefix + randomPart;
  // Result: pk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8...
}
```

**Why this pattern:**
- `pk_` prefix makes keys identifiable (easier to spot in logs)
- `randomBytes(18)` provides cryptographic security (1.4e43 combinations)
- 44-character total is a good balance between security and usability
- Hex format is URL-safe and database-friendly

## Project Architecture

### Backend Flow
```
HTTP GET /api/analytics/realtime?projectIds=project-1&start=2024-01-01
  ↓
analyticsRouter.get("/analytics/realtime")
  ↓
fetchRows() - Queries Supabase interaction_events table
  ↓
makeRealtime() - Generates: onlineUsers, chart data, regions, pages
  ↓
response.json({ ...realtimeData })
```

### Frontend Flow
```
RealTimePage Component Mount
  ↓
useQuery({
  queryKey: ["analytics", "realtime", projectIds, start, end, ...],
  queryFn: () => fetchRealtimeAnalytics({ projectIds, start, end, ... })
})
  ↓
isLoading ? <SkeletonCard /> : <DataViz />
  ↓
Display live user count, chart, regions, pages
```

## Common Implementation Questions

### Q: How do I populate the interaction_events table?

A: Use your existing event tracking system. Insert events as users interact:

```typescript
// When user performs action on your site:
async function trackEvent(sessionId: string, eventType: "click" | "scroll" | "attention") {
  const { error } = await supabaseClient
    .from("interaction_events")
    .insert({
      project_id: "your-project-id",
      session_id: sessionId,
      page_path: window.location.pathname,
      event_type: eventType,
      value: eventData.value, // e.g., scroll depth %
      device_type: getDeviceType(), // "desktop", "mobile", "tablet"
      created_at: new Date().toISOString(),
    });
}
```

### Q: Can I use different colors?

A: Yes! The color system uses CSS variables. Update Tailwind config:

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: "hsl(220, 90%, 50%)", // Your custom primary color
      accent: "hsl(220, 20%, 95%)",  // Light variant
    }
  }
}
```

Then all components automatically use your colors.

### Q: How do I add more analytics pages?

A: Follow this pattern:

```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchCustomAnalytics } from "@/lib/analyticsApi";

export default function CustomAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "custom", projectIds, ...],
    queryFn: () => fetchCustomAnalytics({ projectIds, ... })
  });

  return (
    <>
      {isLoading ? (
        <SkeletonCard />
      ) : (
        <div>
          {/* Your visualization */}
        </div>
      )}
    </>
  );
}
```

### Q: How do I export the data?

A: Each page already has an export button. It generates JSON:

```typescript
const handleExport = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `analytics-${Date.now()}.json`;
  link.click();
};
```

## Sidebar Navigation Improvements

The sidebar collapse now has:
- Better spacing when collapsed (mx-1 vs mx-2)
- Improved icon visibility (h-5 w-5)
- Smoother transitions (duration-150)
- Better visual hierarchy
- User profile footer with quick access menu

Key improvements in AppSidebar.tsx:
```typescript
// Responsive padding based on collapse state
className={cn(
  "rounded-lg transition-all duration-150 h-10",
  collapsed ? "mx-1" : "mx-2", // Tighter when collapsed
)}

// Icon sizing for better visibility
<item.icon className={cn("h-5 w-5 shrink-0")} />

// User profile layout changes based on collapse state
{collapsed ? "justify-center p-2" : "justify-between p-2.5"}
```

## Testing Your Implementation

1. **Test Backend APIs Directly**
   ```bash
   curl "http://localhost:3000/api/analytics/realtime?projectIds=test-project&start=2024-01-01&end=2024-01-31"
   ```

2. **Check Browser Console**
   - Network tab: Verify analytics endpoints return `200 OK`
   - Application tab: Check React Query caching

3. **Verify Data Display**
   - Each page should conditionally render based on `isLoading`
   - Charts should display data from backend
   - Export buttons should work

4. **Test Filters**
   - Date range changes should refetch data
   - Device/user type filters should adjust results
   - Project ID selection should persist

## File Size Optimization

If analytics pages make your app too large, code-split them:

```typescript
// In your router
const RealTimePage = lazy(() => import("@/pages/RealTimePage"));

// In your routes
<Route path="/analytics/realtime" element={<Suspense fallback={<Loading />}><RealTimePage /></Suspense>} />
```

This reduces initial bundle size by ~50KB.

## Next Steps

1. ✅ Install dependencies
2. ✅ Copy API client (`analyticsApi.ts`)
3. ✅ Setup backend route (`analytics.ts`)
4. ✅ Create Supabase table
5. ✅ Copy frontend pages
6. ✅ Wire up routing
7. ✅ Start tracking events
8. ✅ View dashboards at `/analytics/realtime`, etc.

---

**Questions?** Check the TrackAura source code for reference implementations of each component.

## Minimal Integration (Another Project)

Use this when you want analytics blocks to open only after integration is done.

Tip: In TrackAura -> Projects page, use the **Quick Install Tracker** panel to copy Step 1/Step 2 install commands and a project-specific init command directly.

### 0) One-line tracker module (recommended)

Add this in your external website:

```html
<script src="http://localhost:8080/trackaura-tracker.js"></script>
<script>
  window.ta = TrackAuraTracker.init({
    apiBaseUrl: "http://localhost:4000",
    projectId: "your-project-id"
  });
</script>
```

That is enough to start sending click, scroll, and attention events.

Optional manual tracking:

```html
<script>
  // Example custom event
  window.ta.track("click", { x: 120, y: 320, value: 1 });
</script>
```

### 0.1) npm link workflow (local development)

One-command setup from TrackAura root:

```bash
npm run bootstrap:local
```

This command installs frontend + backend + tracker package dependencies and links `@trackaura/tracker` into the root app.

From TrackAura repo:

```bash
cd packages/trackaura-tracker
npm link
```

From your other project:

```bash
npm link /absolute/path/to/TrackAura/packages/trackaura-tracker
```

Use in your app:

```js
import { initTrackAuraTracker } from "@trackaura/tracker";

initTrackAuraTracker({
  apiBaseUrl: "http://localhost:4000",
  projectId: "your-project-id"
});
```

To unlink later:

```bash
# in target app
npm unlink @trackaura/tracker

# in package folder
cd packages/trackaura-tracker
npm unlink
```

### 1) Create project and keep its project ID

1. Open TrackAura -> Projects.
2. Create a project.
3. Select it in Project Scope filter (this enables analytics queries now).

### 2) Send events from your other website/app

TrackAura backend endpoint:

```http
POST http://localhost:4000/api/events/batch
Content-Type: application/json
```

Important CORS note:

Set backend CORS for your external app origin in backend/.env:

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

Use `*` only for local testing.

Payload format:

```json
{
  "projectId": "your-project-id",
  "pagePath": "/pricing",
  "sessionId": "session_abc123",
  "events": [
    {
      "eventType": "click",
      "x": 540,
      "y": 280,
      "value": 1,
      "viewportW": 1440,
      "viewportH": 900,
      "deviceType": "desktop"
    }
  ]
}
```

### 3) Drop-in browser snippet (example)

```html
<script>
  (function () {
    const API_BASE = "http://localhost:4000";
    const PROJECT_ID = "your-project-id";
    const SESSION_KEY = "trackaura.sessionId";
    const sessionId = localStorage.getItem(SESSION_KEY) || ("s_" + crypto.randomUUID());
    localStorage.setItem(SESSION_KEY, sessionId);

    function deviceType() {
      const w = window.innerWidth;
      if (w < 768) return "mobile";
      if (w < 1024) return "tablet";
      return "desktop";
    }

    function send(eventType, x, y, value) {
      const payload = {
        projectId: PROJECT_ID,
        pagePath: location.pathname,
        sessionId,
        events: [
          {
            eventType,
            x,
            y,
            value,
            viewportW: window.innerWidth,
            viewportH: window.innerHeight,
            deviceType: deviceType(),
            createdAt: new Date().toISOString()
          }
        ]
      };

      navigator.sendBeacon(
        API_BASE + "/api/events/batch",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
    }

    window.addEventListener("click", (e) => send("click", e.clientX, e.clientY, 1));
    window.addEventListener("scroll", () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const depth = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      send("scroll", 0, window.scrollY, Math.max(1, depth));
    }, { passive: true });
  })();
</script>
```

### 4) Verify quickly

```bash
curl "http://localhost:4000/api/analytics/realtime?projectIds=your-project-id"
```

If this returns JSON, your Real-Time, Funnels, Retention, and Performance blocks will render.

## Authentication + Access Lock

Implemented in this project:

1. Login, Sign Up, Forgot Password page at `/auth`
2. Google OAuth via Supabase
3. Dashboard routes are protected (unauthenticated users are redirected to `/auth`)
4. Overview removed from dashboard navigation
5. Analytics pages are locked until at least one project is created

Required frontend env values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Google sign-in setup:

1. In Supabase Auth providers, enable Google.
2. Add redirect URL: `https://your-app-domain/auth` and local URL `http://localhost:8080/auth`.

## Session Replay System (MongoDB)

### Backend requirements

New endpoints:

1. `POST /api/session-events`
2. `GET /api/session-replay/sessions`
3. `GET /api/session-replay/:sessionId`

Backend env:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=trackaura
SESSION_TTL_SECONDS=86400
```

Session TTL index is automatically created for 24-hour cleanup.

### Recorder payload

```json
{
  "sessionId": "s_abc123",
  "page": "/pricing",
  "events": [
    {
      "type": "mousemove",
      "x": 420,
      "y": 188,
      "timestamp": 1710000000000
    }
  ]
}
```

Captured events:

1. `mousemove`
2. `click`
3. `scroll`
4. `input`
5. `navigation`

Recorder sends batched events every 4 seconds with throttling.

## After Deploy (production URLs)

When you deploy, replace all localhost URLs:

1. Tracker `apiBaseUrl`:
  `http://localhost:4000` -> `https://api.yourdomain.com`
2. Script URL (if using script tag):
  `http://localhost:8080/trackaura-tracker.js` -> `https://app.yourdomain.com/trackaura-tracker.js`
3. Backend CORS in `backend/.env`:

```env
CORS_ORIGIN=https://app.yourdomain.com,https://www.yourdomain.com
```

4. Frontend env in root `.env`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

5. Restart backend after env updates.
