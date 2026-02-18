
## Enterprise Analytics Dashboard

A full-featured analytics dashboard with simulated live data, emerald/green accent colors, white Swiss design, and a collapsible sidebar navigation — matching the quality of Mixpanel, Amplitude, and PostHog.

---

### App Structure & Navigation

**Collapsible Left Sidebar** with:
- Dashboard (overview)
- Real-Time
- Funnels
- Retention
- Performance
- Insights
- Mini icon-only mode when collapsed

**Top header bar** with:
- Global filter bar (date range picker, device filter, user type filter)
- Export controls (CSV, PDF, Download Report) in top-right
- Refresh button

---

### Page: Overview Dashboard

A high-level summary with KPI cards and sparklines showing:
- Total Users, Active Sessions, Conversion Rate, Avg. Session Duration
- Staggered fade-in animations on load
- Skeleton loaders before data appears

---

### Section 1 — Real-Time Online Users

- Large live counter card with pulsing green dot
- Counter smoothly increments/decrements using simulated live data (updates every 2–3 seconds)
- Small sparkline showing last 60 seconds of activity
- "Users online now" label with last-updated timestamp

---

### Section 2 — Conversion Funnel

- Vertical funnel chart: Visitor → Signup → Profile Complete → First Action → Active User
- Each stage shows count + percentage of top
- Drop-off percentage shown between stages in a subtle callout
- Hover tooltips with detailed stats
- Emerald color gradient from wide to narrow
- Fully responsive layout

---

### Section 3 — User Retention (Cohort Heatmap)

- Grid table with cohort rows (Week 1, Week 2, Week 3, etc.) and columns (Day 1, Day 7, Day 14, Day 30)
- Cell color intensity from light green → deep emerald based on retention %
- Hover tooltip showing exact % and user count
- Clean bordered grid, no heavy shadows

---

### Section 4 — Performance Monitoring

- System health panel with:
  - Average API response time (with inline bar chart)
  - Error rate (small red progress bar)
  - Failed requests count
  - Slow endpoints list with response time badges
- Color-coded status: green (healthy), yellow (warning), red (critical)

---

### Section 5 — Smart Insights Panel

- Card-style panel with 3–5 auto-rotating AI-style insights
- Examples: "User activity increased 18% this week", "Peak traffic at 9 PM"
- Lightbulb / Sparkle icon per insight
- Highlighted emerald left border on each item
- Subtle fade animation when insights rotate

---

### Global Filter Bar (Top of Dashboard)

- Date range picker (last 7 days, 30 days, 90 days, custom)
- Device segmentation: All / Web / Mobile
- User type: All / Free / Pro / Enterprise
- Refresh button with spinning animation
- Fully responsive — collapses into a compact row on mobile

---

### Export Controls (Top Right)

- "Export CSV" button
- "Export PDF" button  
- "Download Report" dropdown with format options
- Toast notification on export action

---

### Polish & UX

- Skeleton loaders on every section while "data loads"
- Empty states with helpful messages and icons
- Staggered entrance animations on all cards and charts
- Smooth hover effects on all interactive elements
- Fully mobile-responsive layout
- White/light background with emerald accents throughout
- Recharts used for all visualizations (already installed)
