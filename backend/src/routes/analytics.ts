import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { HttpError } from "../middleware/errorHandler.js";
import { analyticsQuerySchema } from "../validation/events.js";

type DeviceType = "desktop" | "tablet" | "mobile";
type EventType = "click" | "scroll" | "attention";

interface EventRow {
  session_id: string;
  page_path: string;
  event_type: EventType;
  created_at: string;
  value: number;
  device_type: DeviceType;
}

function parseProjectIds(raw: string) {
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseDateRange(start?: string, end?: string) {
  const to = end ? new Date(end) : new Date();
  const from = start ? new Date(start) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from, to };
}

function getSessionUserType(sessionId: string): "free" | "pro" | "enterprise" {
  const hash = Math.abs(sessionId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0));
  const bucket = hash % 100;
  if (bucket < 60) return "free";
  if (bucket < 90) return "pro";
  return "enterprise";
}

function uniqueSessions(rows: EventRow[]) {
  return new Set(rows.map((row) => row.session_id)).size;
}

function getTopPages(rows: EventRow[]) {
  const counts = new Map<string, number>();
  rows.forEach((row) => counts.set(row.page_path, (counts.get(row.page_path) ?? 0) + 1));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, events]) => ({ path, events }));
}

function makeRealtime(rows: EventRow[], from: Date, to: Date) {
  const oneMinAgo = new Date(to.getTime() - 60 * 1000);
  const twoMinAgo = new Date(to.getTime() - 2 * 60 * 1000);

  const currentRows = rows.filter((row) => new Date(row.created_at) >= oneMinAgo);
  const previousRows = rows.filter((row) => {
    const ts = new Date(row.created_at);
    return ts >= twoMinAgo && ts < oneMinAgo;
  });

  const onlineUsers = uniqueSessions(currentRows);
  const previousUsers = uniqueSessions(previousRows);

  const trend = onlineUsers > previousUsers ? "up" : onlineUsers < previousUsers ? "down" : "stable";

  const points = Array.from({ length: 60 }, (_, i) => {
    const bucketStart = new Date(to.getTime() - (59 - i) * 60 * 1000);
    const bucketEnd = new Date(bucketStart.getTime() + 60 * 1000);
    const bucketRows = rows.filter((row) => {
      const ts = new Date(row.created_at);
      return ts >= bucketStart && ts < bucketEnd;
    });

    return {
      t: i,
      label: bucketStart.toISOString().slice(11, 16),
      v: Math.max(0, uniqueSessions(bucketRows)),
    };
  });

  const sessionMap = new Map<string, EventRow[]>();
  for (const row of rows) {
    if (!sessionMap.has(row.session_id)) {
      sessionMap.set(row.session_id, []);
    }
    sessionMap.get(row.session_id)?.push(row);
  }

  const sessions = [...sessionMap.values()];

  const avgDurationSec = sessions.length
    ? Math.round(
        sessions.reduce((acc, events) => {
          const sorted = [...events].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
          if (sorted.length < 2) return acc;
          const durationSec = Math.max(0, Math.round((+new Date(sorted.at(-1)!.created_at) - +new Date(sorted[0].created_at)) / 1000));
          return acc + durationSec;
        }, 0) / sessions.length
      )
    : 0;

  const bounceSessions = sessions.filter((events) => {
    const pageSet = new Set(events.map((event) => event.page_path));
    return pageSet.size <= 1;
  }).length;
  const bounceRate = sessions.length ? Number(((bounceSessions / sessions.length) * 100).toFixed(1)) : 0;

  const newSessions = sessions.filter((events) => {
    const daySet = new Set(events.map((event) => event.created_at.slice(0, 10)));
    return daySet.size <= 1;
  }).length;
  const returningSessions = Math.max(0, sessions.length - newSessions);

  const deviceCounts = currentRows.reduce(
    (acc, row) => {
      if (row.device_type === "mobile") acc.mobile += 1;
      else if (row.device_type === "tablet") acc.tablet += 1;
      else acc.desktop += 1;
      return acc;
    },
    { mobile: 0, desktop: 0, tablet: 0 }
  );

  const deviceTotal = Math.max(1, deviceCounts.mobile + deviceCounts.desktop + deviceCounts.tablet);
  const deviceBreakdown = [
    { name: "mobile", value: Math.round((deviceCounts.mobile / deviceTotal) * 100) },
    { name: "desktop", value: Math.round((deviceCounts.desktop / deviceTotal) * 100) },
    { name: "tablet", value: Math.round((deviceCounts.tablet / deviceTotal) * 100) },
  ];

  const todayKey = to.toISOString().slice(0, 10);
  const todayRows = rows.filter((row) => row.created_at.slice(0, 10) === todayKey);
  const minuteBuckets = new Map<string, Set<string>>();

  for (const row of todayRows) {
    const minute = row.created_at.slice(11, 16);
    if (!minuteBuckets.has(minute)) {
      minuteBuckets.set(minute, new Set());
    }
    minuteBuckets.get(minute)?.add(row.session_id);
  }

  const peakEntry = [...minuteBuckets.entries()].sort((a, b) => b[1].size - a[1].size)[0];
  const peakTraffic = {
    time: peakEntry?.[0] ?? to.toISOString().slice(11, 16),
    users: peakEntry?.[1].size ?? onlineUsers,
    deltaPct: previousUsers > 0 ? Math.round(((onlineUsers - previousUsers) / previousUsers) * 100) : 0,
  };

  const regionNames = [
    "India - North",
    "India - West",
    "India - South",
    "India - East",
    "India - Central",
  ];
  const regionSessionSets = [
    new Set<string>(),
    new Set<string>(),
    new Set<string>(),
    new Set<string>(),
    new Set<string>(),
  ];

  for (const row of currentRows) {
    const index = Math.abs(row.session_id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % 5;
    regionSessionSets[index].add(row.session_id);
  }

  const totalRegion = Math.max(1, regionSessionSets.reduce((acc, set) => acc + set.size, 0));
  const regions = regionSessionSets.map((sessionSet, index) => ({
    name: regionNames[index],
    users: sessionSet.size,
    pct: Math.round((sessionSet.size / totalRegion) * 100),
  }));

  return {
    onlineUsers,
    trend,
    lastUpdated: to.toISOString(),
    data: points,
    regions,
    pages: getTopPages(currentRows),
    stats: {
      sessions: sessions.length,
      avgDurationSec,
      bounceRate,
    },
    newVsReturning: {
      new: newSessions,
      returning: returningSessions,
    },
    deviceBreakdown,
    peakTraffic,
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function makeFunnels(rows: EventRow[]) {
  const bySession = new Map<string, Set<EventType>>();
  for (const row of rows) {
    if (!bySession.has(row.session_id)) bySession.set(row.session_id, new Set());
    bySession.get(row.session_id)?.add(row.event_type);
  }

  let engaged = 0;
  let clicked = 0;
  let scrolled = 0;
  let converted = 0;

  bySession.forEach((types) => {
    if (types.has("attention")) engaged += 1;
    if (types.has("click")) clicked += 1;
    if (types.has("scroll")) scrolled += 1;
    if (types.has("click") && types.has("scroll")) converted += 1;
  });

  const visitors = bySession.size;
  const stages = [
    { name: "Visitors", value: visitors },
    { name: "Engaged", value: engaged },
    { name: "Clicked", value: clicked },
    { name: "Scrolled", value: scrolled },
    { name: "Converted", value: converted },
  ];

  return {
    stages,
    totals: {
      visitors,
      converted,
      conversionRate: visitors > 0 ? Number(((converted / visitors) * 100).toFixed(2)) : 0,
    },
  };
}

function makeRetention(rows: EventRow[], to: Date) {
  const sessionDays = new Map<string, Set<string>>();

  for (const row of rows) {
    const day = row.created_at.slice(0, 10);
    if (!sessionDays.has(row.session_id)) sessionDays.set(row.session_id, new Set());
    sessionDays.get(row.session_id)?.add(day);
  }

  const cohorts = new Map<string, { users: number; day7: number; day14: number; day30: number; ageDays: number }>();

  sessionDays.forEach((daysSet) => {
    const days = [...daysSet].sort();
    const first = new Date(`${days[0]}T00:00:00.000Z`);
    const cohortLabel = `${days[0]}`;

    if (!cohorts.has(cohortLabel)) {
      const ageDays = Math.floor((to.getTime() - first.getTime()) / (24 * 60 * 60 * 1000));
      cohorts.set(cohortLabel, { users: 0, day7: 0, day14: 0, day30: 0, ageDays });
    }

    const cohort = cohorts.get(cohortLabel)!;
    cohort.users += 1;

    const offsets = days.map((day) => Math.floor((new Date(`${day}T00:00:00.000Z`).getTime() - first.getTime()) / (24 * 60 * 60 * 1000)));

    if (offsets.some((offset) => offset >= 7)) cohort.day7 += 1;
    if (offsets.some((offset) => offset >= 14)) cohort.day14 += 1;
    if (offsets.some((offset) => offset >= 30)) cohort.day30 += 1;
  });

  const sorted = [...cohorts.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 8);

  const cohortData = sorted.map(([cohort, value]) => ({
    cohort,
    users: value.users,
    retention: [
      100,
      value.ageDays >= 7 ? Math.round((value.day7 / Math.max(1, value.users)) * 100) : null,
      value.ageDays >= 14 ? Math.round((value.day14 / Math.max(1, value.users)) * 100) : null,
      value.ageDays >= 30 ? Math.round((value.day30 / Math.max(1, value.users)) * 100) : null,
    ],
  }));

  return {
    cohortColumns: ["Day 1", "Day 7", "Day 14", "Day 30"],
    cohortData,
  };
}

function makePerformance(rows: EventRow[], from: Date, to: Date) {
  const total = rows.length;
  const durationMinutes = Math.max(1, (to.getTime() - from.getTime()) / (60 * 1000));
  const eventsPerMinute = total / durationMinutes;

  const avgResponseMs = Math.round(80 + eventsPerMinute * 2.2);
  const failedRequests = rows.filter((row) => row.event_type === "scroll" && row.value >= 95).length;
  const errorRate = total > 0 ? Number(((failedRequests / total) * 100).toFixed(2)) : 0;

  const responseTimeSeries = Array.from({ length: 12 }, (_, i) => {
    const bucketStart = new Date(from.getTime() + (i * (to.getTime() - from.getTime())) / 12);
    const bucketEnd = new Date(from.getTime() + ((i + 1) * (to.getTime() - from.getTime())) / 12);
    const bucketRows = rows.filter((row) => {
      const ts = new Date(row.created_at);
      return ts >= bucketStart && ts < bucketEnd;
    });

    return {
      time: bucketStart.toISOString().slice(11, 16),
      ms: Math.round(70 + bucketRows.length * 2.8),
    };
  });

  const errorRateSeries = Array.from({ length: 12 }, (_, i) => {
    const bucketStart = new Date(from.getTime() + (i * (to.getTime() - from.getTime())) / 12);
    const bucketEnd = new Date(from.getTime() + ((i + 1) * (to.getTime() - from.getTime())) / 12);
    const bucketRows = rows.filter((row) => {
      const ts = new Date(row.created_at);
      return ts >= bucketStart && ts < bucketEnd;
    });

    const bucketFailed = bucketRows.filter((row) => row.event_type === "scroll" && row.value >= 95).length;
    return {
      time: bucketStart.toISOString().slice(11, 16),
      rate: bucketRows.length > 0 ? Number(((bucketFailed / bucketRows.length) * 100).toFixed(2)) : 0,
    };
  });

  const pages = getTopPages(rows);
  const slowEndpoints = pages.slice(0, 5).map((page) => {
    const p99 = Math.round(120 + page.events * 4.5);
    return {
      path: `/track${page.path}`,
      p99,
      status: p99 < 700 ? "ok" : p99 < 1700 ? "warning" : "critical",
    };
  });

  return {
    apiMetrics: {
      avgResponseMs,
      errorRate,
      failedRequests,
      slowEndpoints,
    },
    responseTimeSeries,
    errorRateSeries,
  };
}

function makeOverview(rows: EventRow[], from: Date, to: Date) {
  const usersTotal = uniqueSessions(rows);
  const fiveMinAgo = new Date(to.getTime() - 5 * 60 * 1000);
  const activeSessions = uniqueSessions(rows.filter((row) => new Date(row.created_at) >= fiveMinAgo));

  const sessionMap = new Map<string, EventRow[]>();
  rows.forEach((row) => {
    if (!sessionMap.has(row.session_id)) {
      sessionMap.set(row.session_id, []);
    }
    sessionMap.get(row.session_id)?.push(row);
  });

  const sessions = [...sessionMap.values()];
  const convertedSessions = sessions.filter((events) => {
    const types = new Set(events.map((event) => event.event_type));
    return types.has("click") && types.has("scroll");
  }).length;

  const conversionRate = usersTotal > 0 ? Number(((convertedSessions / usersTotal) * 100).toFixed(2)) : 0;

  const avgSessionSeconds = sessions.length
    ? Math.round(
        sessions.reduce((acc, events) => {
          const sorted = [...events].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
          if (sorted.length < 2) return acc;
          return acc + (new Date(sorted.at(-1)!.created_at).getTime() - new Date(sorted[0].created_at).getTime()) / 1000;
        }, 0) / sessions.length
      )
    : 0;

  const midpoint = new Date((from.getTime() + to.getTime()) / 2);
  const firstHalf = rows.filter((row) => new Date(row.created_at) < midpoint);
  const secondHalf = rows.filter((row) => new Date(row.created_at) >= midpoint);

  const pctChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  };

  const totalUsersChange = pctChange(uniqueSessions(secondHalf), uniqueSessions(firstHalf));
  const activeSessionsChange = pctChange(
    uniqueSessions(secondHalf.filter((row) => row.event_type === "attention")),
    uniqueSessions(firstHalf.filter((row) => row.event_type === "attention"))
  );

  const firstHalfSessionSeconds = (() => {
    const map = new Map<string, EventRow[]>();
    firstHalf.forEach((row) => {
      if (!map.has(row.session_id)) map.set(row.session_id, []);
      map.get(row.session_id)?.push(row);
    });
    const values = [...map.values()].map((events) => {
      const sorted = [...events].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
      if (sorted.length < 2) return 0;
      return Math.round((new Date(sorted.at(-1)!.created_at).getTime() - new Date(sorted[0].created_at).getTime()) / 1000);
    });
    if (!values.length) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  })();

  const avgSessionChange = pctChange(avgSessionSeconds, firstHalfSessionSeconds);

  const dailyBuckets = new Map<string, EventRow[]>();
  rows.forEach((row) => {
    const dayKey = row.created_at.slice(0, 10);
    if (!dailyBuckets.has(dayKey)) dailyBuckets.set(dayKey, []);
    dailyBuckets.get(dayKey)?.push(row);
  });

  const dauSeries = [...dailyBuckets.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-30)
    .map(([day, events]) => ({
      day: day.slice(8, 10),
      users: uniqueSessions(events),
      sessions: events.length,
    }));

  const deviceCounts = rows.reduce(
    (acc, row) => {
      if (row.device_type === "desktop") acc.web += 1;
      if (row.device_type === "mobile") acc.mobile += 1;
      if (row.device_type === "tablet") acc.tablet += 1;
      return acc;
    },
    { web: 0, mobile: 0, tablet: 0 }
  );

  const deviceTotal = Math.max(1, deviceCounts.web + deviceCounts.mobile + deviceCounts.tablet);
  const deviceData = [
    { name: "Web", value: Math.round((deviceCounts.web / deviceTotal) * 100) },
    { name: "Mobile", value: Math.round((deviceCounts.mobile / deviceTotal) * 100) },
    { name: "Tablet", value: Math.round((deviceCounts.tablet / deviceTotal) * 100) },
  ];

  const hourlyMap = new Map<string, Set<string>>();
  rows.forEach((row) => {
    const hour = new Date(row.created_at).getHours().toString().padStart(2, "0");
    if (!hourlyMap.has(hour)) hourlyMap.set(hour, new Set());
    hourlyMap.get(hour)?.add(row.session_id);
  });

  const hourlyTraffic = Array.from({ length: 24 }, (_, index) => {
    const hour = index.toString().padStart(2, "0");
    return {
      hour,
      users: hourlyMap.get(hour)?.size ?? 0,
    };
  });

  const pageMap = new Map<string, { events: number; sessions: Set<string> }>();
  rows.forEach((row) => {
    if (!pageMap.has(row.page_path)) {
      pageMap.set(row.page_path, { events: 0, sessions: new Set() });
    }
    const bucket = pageMap.get(row.page_path)!;
    bucket.events += 1;
    bucket.sessions.add(row.session_id);
  });

  const topPages = [...pageMap.entries()]
    .sort((a, b) => b[1].events - a[1].events)
    .slice(0, 5)
    .map(([path, value]) => {
      const bouncePct = value.sessions.size > 0 ? Math.max(8, Math.min(85, Math.round((value.sessions.size / Math.max(1, value.events)) * 100))) : 0;
      return {
        path,
        views: value.events,
        bounce: `${bouncePct}%`,
      };
    });

  const trendSeries = (values: number[]) => {
    const safe = values.length ? values : [0];
    return safe;
  };

  return {
    kpiCards: [
      {
        title: "Total Users",
        value: usersTotal.toLocaleString(),
        change: `${totalUsersChange >= 0 ? "+" : ""}${totalUsersChange}%`,
        positive: totalUsersChange >= 0,
        sub: "vs first half of selected range",
        trendSeries: trendSeries(dauSeries.map((point) => point.users)),
      },
      {
        title: "Active Sessions",
        value: activeSessions.toLocaleString(),
        change: `${activeSessionsChange >= 0 ? "+" : ""}${activeSessionsChange}%`,
        positive: activeSessionsChange >= 0,
        sub: "last 5 minutes",
        trendSeries: trendSeries(hourlyTraffic.map((point) => point.users)),
      },
      {
        title: "Conversion Rate",
        value: `${conversionRate}%`,
        change: `${conversionRate >= 10 ? "+" : ""}${Number((conversionRate - 10).toFixed(1))}%`,
        positive: conversionRate >= 10,
        sub: "sessions with click + scroll",
        trendSeries: trendSeries(dauSeries.map((point) => point.sessions)),
      },
      {
        title: "Avg. Session",
        value: `${Math.floor(avgSessionSeconds / 60)}m ${String(avgSessionSeconds % 60).padStart(2, "0")}s`,
        change: `${avgSessionChange >= 0 ? "+" : ""}${avgSessionChange}%`,
        positive: avgSessionChange >= 0,
        sub: "session duration",
        trendSeries: trendSeries(hourlyTraffic.map((point) => point.users)),
      },
    ],
    dauSeries,
    deviceData,
    hourlyTraffic,
    topPages,
    conversionSummary: {
      rate: conversionRate,
      delta: Number((conversionRate - 10).toFixed(1)),
    },
  };
}

function makeSessionReplay(rows: EventRow[], search?: string, limit = 20) {
  const grouped = new Map<string, EventRow[]>();
  rows.forEach((row) => {
    if (!grouped.has(row.session_id)) grouped.set(row.session_id, []);
    grouped.get(row.session_id)?.push(row);
  });

  const sessions = [...grouped.entries()]
    .map(([sessionId, events]) => {
      const sorted = [...events].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const durationSec = Math.max(0, Math.round((+new Date(last.created_at) - +new Date(first.created_at)) / 1000));
      const clicks = sorted.filter((event) => event.event_type === "click").length;
      const scrollValues = sorted.filter((event) => event.event_type === "scroll").map((event) => event.value);
      const maxScroll = scrollValues.length ? Math.max(...scrollValues) : 0;
      const pathSet = new Set(sorted.map((event) => event.page_path));

      const replayEvents = sorted.slice(0, 120).map((event) => {
        const timeOffsetSec = Math.max(0, Math.round((+new Date(event.created_at) - +new Date(first.created_at)) / 1000));
        const m = Math.floor(timeOffsetSec / 60);
        const s = String(timeOffsetSec % 60).padStart(2, "0");

        if (event.event_type === "click") {
          return { time: `${m}:${s}`, type: "click", detail: `Click value ${event.value} on ${event.page_path}` };
        }

        if (event.event_type === "scroll") {
          return { time: `${m}:${s}`, type: "scroll", detail: `Scroll depth ${event.value}%` };
        }

        return { time: `${m}:${s}`, type: "attention", detail: `Attention score ${event.value}` };
      });

      return {
        id: sessionId,
        user: `user_${sessionId.slice(0, 6)}`,
        email: `${sessionId.slice(0, 6)}@tracked.local`,
        device: first.device_type,
        durationSec,
        pages: pathSet.size,
        clicks,
        scrollDepth: Math.max(0, Math.min(100, maxScroll)),
        startTime: first.created_at,
        events: replayEvents,
      };
    })
    .sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime));

  const filtered = search
    ? sessions.filter((session) => {
        const q = search.toLowerCase();
        return session.user.toLowerCase().includes(q) || session.email.toLowerCase().includes(q) || session.id.toLowerCase().includes(q);
      })
    : sessions;

  const limited = filtered.slice(0, limit);

  const avgDuration = limited.length
    ? Math.round(limited.reduce((acc, session) => acc + session.durationSec, 0) / limited.length)
    : 0;

  return {
    sessions: limited,
    stats: {
      totalSessions: filtered.length,
      avgDurationSec: avgDuration,
      mobileSessions: filtered.filter((session) => session.device === "mobile").length,
    },
  };
}

export const analyticsRouter = Router();

async function fetchRows(reqQuery: unknown) {
  const parsed = analyticsQuerySchema.safeParse(reqQuery);
  if (!parsed.success) {
    console.warn("[analytics] Invalid query params", parsed.error.flatten());
    throw new HttpError(400, "Invalid analytics query params");
  }

  const { projectIds, start, end, deviceType, userType, pagePath } = parsed.data;
  const projectList = parseProjectIds(projectIds);

  console.log("[analytics] Query received", {
    projectIds: projectList,
    start: start ?? null,
    end: end ?? null,
    deviceType: deviceType ?? "ALL",
    userType: userType ?? "ALL",
    pagePath: pagePath ?? "ALL",
  });

  if (!projectList.length) {
    throw new HttpError(400, "At least one project ID is required");
  }

  const { from, to } = parseDateRange(start, end);

  let query = supabaseAdmin
    .from("interaction_events")
    .select("session_id,page_path,event_type,created_at,value,device_type")
    .in("project_id", projectList)
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString())
    .order("created_at", { ascending: true })
    .limit(50000);

  if (deviceType) query = query.eq("device_type", deviceType);
  if (pagePath) query = query.eq("page_path", pagePath);

  const { data, error } = await query;
  if (error) throw new HttpError(500, error.message);

  const rows = ((data ?? []) as EventRow[]).filter((row) => {
    if (!userType) return true;
    return getSessionUserType(row.session_id) === userType;
  });

  console.log("[analytics] Query result", {
    requestedProjects: projectList,
    rawRows: (data ?? []).length,
    filteredRows: rows.length,
    from: from.toISOString(),
    to: to.toISOString(),
  });

  return {
    rows,
    from,
    to,
    projectIds: projectList,
  };
}

analyticsRouter.get("/analytics/realtime", async (req, res, next) => {
  try {
    const { rows, from, to, projectIds } = await fetchRows(req.query);
    res.json({ projectIds, ...makeRealtime(rows, from, to) });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get("/analytics/funnels", async (req, res, next) => {
  try {
    const { rows, projectIds } = await fetchRows(req.query);
    res.json({ projectIds, ...makeFunnels(rows) });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get("/analytics/retention", async (req, res, next) => {
  try {
    const { rows, to, projectIds } = await fetchRows(req.query);
    res.json({ projectIds, ...makeRetention(rows, to) });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get("/analytics/performance", async (req, res, next) => {
  try {
    const { rows, from, to, projectIds } = await fetchRows(req.query);
    res.json({ projectIds, ...makePerformance(rows, from, to) });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get("/analytics/overview", async (req, res, next) => {
  try {
    const { rows, from, to, projectIds } = await fetchRows(req.query);
    res.json({ projectIds, from: from.toISOString(), to: to.toISOString(), ...makeOverview(rows, from, to) });
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get("/analytics/sessions", async (req, res, next) => {
  try {
    const parsed = analyticsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid session replay query params");
    }

    const { rows, projectIds, from, to } = await fetchRows(req.query);
    const payload = makeSessionReplay(rows, parsed.data.search, parsed.data.limit);
    res.json({ projectIds, from: from.toISOString(), to: to.toISOString(), ...payload });
  } catch (error) {
    next(error);
  }
});
