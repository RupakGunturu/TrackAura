import { useState, useEffect } from "react";
import {
  Play, Pause, SkipForward, SkipBack, Monitor, Smartphone, Clock,
  MousePointerClick, Eye, ScrollText, ArrowUpRight, ChevronRight, Search, Filter as FilterIcon
} from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock session data
const sessions = [
  {
    id: "sess-001",
    user: "user_8f4a2c",
    email: "sarah.j@gmail.com",
    device: "desktop",
    browser: "Chrome 122",
    os: "macOS 14.3",
    country: "US",
    flag: "🇺🇸",
    duration: "6m 42s",
    durationSec: 402,
    pages: 8,
    clicks: 24,
    scrollDepth: 78,
    startTime: "2:34 PM",
    date: "Today",
    rage: false,
    deadClicks: 1,
    events: [
      { time: "0:00", type: "pageview", detail: "/dashboard", icon: "page" },
      { time: "0:12", type: "click", detail: "Nav → Reports", icon: "click" },
      { time: "0:18", type: "pageview", detail: "/reports", icon: "page" },
      { time: "0:45", type: "scroll", detail: "Scrolled 65%", icon: "scroll" },
      { time: "1:02", type: "click", detail: "Export CSV button", icon: "click" },
      { time: "1:15", type: "click", detail: "Date range picker", icon: "click" },
      { time: "1:38", type: "pageview", detail: "/reports/weekly", icon: "page" },
      { time: "2:10", type: "scroll", detail: "Scrolled 90%", icon: "scroll" },
      { time: "2:44", type: "click", detail: "Download Report", icon: "click" },
      { time: "3:20", type: "pageview", detail: "/settings", icon: "page" },
      { time: "4:05", type: "click", detail: "Profile avatar", icon: "click" },
      { time: "5:30", type: "pageview", detail: "/profile", icon: "page" },
      { time: "6:12", type: "click", detail: "Save changes", icon: "click" },
      { time: "6:42", type: "exit", detail: "Session ended", icon: "exit" },
    ],
  },
  {
    id: "sess-002",
    user: "user_3b7d9e",
    email: "mike.chen@outlook.com",
    device: "mobile",
    browser: "Safari 17",
    os: "iOS 17.3",
    country: "CA",
    flag: "🇨🇦",
    duration: "2m 18s",
    durationSec: 138,
    pages: 3,
    clicks: 7,
    scrollDepth: 42,
    startTime: "2:28 PM",
    date: "Today",
    rage: true,
    deadClicks: 4,
    events: [
      { time: "0:00", type: "pageview", detail: "/onboarding", icon: "page" },
      { time: "0:22", type: "scroll", detail: "Scrolled 30%", icon: "scroll" },
      { time: "0:35", type: "click", detail: "Get Started button", icon: "click" },
      { time: "0:48", type: "rage", detail: "Rage click on Submit", icon: "rage" },
      { time: "1:05", type: "click", detail: "Back button", icon: "click" },
      { time: "1:30", type: "pageview", detail: "/pricing", icon: "page" },
      { time: "1:55", type: "scroll", detail: "Scrolled 42%", icon: "scroll" },
      { time: "2:18", type: "exit", detail: "Session ended", icon: "exit" },
    ],
  },
  {
    id: "sess-003",
    user: "user_6c1f8a",
    email: "anna.k@yahoo.com",
    device: "desktop",
    browser: "Firefox 123",
    os: "Windows 11",
    country: "DE",
    flag: "🇩🇪",
    duration: "11m 05s",
    durationSec: 665,
    pages: 12,
    clicks: 38,
    scrollDepth: 95,
    startTime: "1:52 PM",
    date: "Today",
    rage: false,
    deadClicks: 0,
    events: [
      { time: "0:00", type: "pageview", detail: "/dashboard", icon: "page" },
      { time: "0:30", type: "click", detail: "KPI card → Users", icon: "click" },
      { time: "1:12", type: "pageview", detail: "/analytics/users", icon: "page" },
      { time: "2:05", type: "scroll", detail: "Scrolled 80%", icon: "scroll" },
      { time: "3:00", type: "click", detail: "Filter → Last 30 days", icon: "click" },
      { time: "4:15", type: "pageview", detail: "/analytics/funnels", icon: "page" },
      { time: "5:30", type: "click", detail: "Funnel stage 3", icon: "click" },
      { time: "6:45", type: "pageview", detail: "/analytics/retention", icon: "page" },
      { time: "8:00", type: "scroll", detail: "Scrolled 95%", icon: "scroll" },
      { time: "9:20", type: "pageview", detail: "/settings", icon: "page" },
      { time: "10:30", type: "click", detail: "Update plan", icon: "click" },
      { time: "11:05", type: "exit", detail: "Session ended", icon: "exit" },
    ],
  },
  {
    id: "sess-004",
    user: "user_9d2e4b",
    email: "james.w@company.co",
    device: "desktop",
    browser: "Edge 122",
    os: "Windows 11",
    country: "GB",
    flag: "🇬🇧",
    duration: "4m 22s",
    durationSec: 262,
    pages: 5,
    clicks: 15,
    scrollDepth: 60,
    startTime: "12:45 PM",
    date: "Today",
    rage: false,
    deadClicks: 2,
    events: [
      { time: "0:00", type: "pageview", detail: "/dashboard", icon: "page" },
      { time: "0:20", type: "click", detail: "Search bar", icon: "click" },
      { time: "0:45", type: "pageview", detail: "/search?q=revenue", icon: "page" },
      { time: "1:30", type: "scroll", detail: "Scrolled 45%", icon: "scroll" },
      { time: "2:15", type: "click", detail: "Result → Revenue Report", icon: "click" },
      { time: "2:50", type: "pageview", detail: "/reports/revenue", icon: "page" },
      { time: "3:30", type: "scroll", detail: "Scrolled 60%", icon: "scroll" },
      { time: "4:00", type: "click", detail: "Share report", icon: "click" },
      { time: "4:22", type: "exit", detail: "Session ended", icon: "exit" },
    ],
  },
  {
    id: "sess-005",
    user: "user_1a5c7f",
    email: "priya.s@startup.io",
    device: "mobile",
    browser: "Chrome 122",
    os: "Android 14",
    country: "IN",
    flag: "🇮🇳",
    duration: "1m 45s",
    durationSec: 105,
    pages: 2,
    clicks: 4,
    scrollDepth: 25,
    startTime: "11:30 AM",
    date: "Today",
    rage: true,
    deadClicks: 3,
    events: [
      { time: "0:00", type: "pageview", detail: "/pricing", icon: "page" },
      { time: "0:30", type: "scroll", detail: "Scrolled 25%", icon: "scroll" },
      { time: "0:50", type: "rage", detail: "Rage click on Pro plan CTA", icon: "rage" },
      { time: "1:10", type: "click", detail: "FAQ accordion", icon: "click" },
      { time: "1:30", type: "pageview", detail: "/contact", icon: "page" },
      { time: "1:45", type: "exit", detail: "Session ended", icon: "exit" },
    ],
  },
];

const eventTypeConfig: Record<string, { color: string; bg: string; icon: typeof MousePointerClick }> = {
  pageview: { color: "text-primary", bg: "bg-accent", icon: Eye },
  click: { color: "text-foreground", bg: "bg-muted", icon: MousePointerClick },
  scroll: { color: "text-muted-foreground", bg: "bg-muted", icon: ScrollText },
  rage: { color: "text-destructive", bg: "bg-destructive/10", icon: MousePointerClick },
  exit: { color: "text-muted-foreground", bg: "bg-muted", icon: ArrowUpRight },
};

export default function SessionReplayPage() {
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Auto-play simulation
  useEffect(() => {
    if (!playing || !selectedSession) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setPlaying(false);
          return 100;
        }
        return p + 0.5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [playing, selectedSession]);

  const activeSession = sessions.find((s) => s.id === selectedSession);
  const filteredSessions = sessions.filter(
    (s) =>
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSession = (id: string) => {
    setSelectedSession(id);
    setProgress(0);
    setPlaying(false);
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Session Replay" subtitle="Watch real user sessions and understand behavior patterns" />
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <SkeletonCard className="lg:col-span-1" lines={8} />
          <SkeletonCard className="lg:col-span-2" lines={10} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Session List */}
          <div className="lg:col-span-1 space-y-3 animate-fade-in-up stagger-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-card border-border"
              />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Sessions", value: sessions.length.toString() },
                { label: "Rage clicks", value: sessions.filter((s) => s.rage).length.toString() },
                { label: "Avg duration", value: "5m 12s" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Session cards */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={cn(
                    "rounded-xl border bg-card p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedSession === session.id
                      ? "border-primary shadow-md bg-accent/30"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{session.flag}</span>
                      <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">{session.email}</span>
                    </div>
                    {session.device === "mobile" ? (
                      <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.duration}
                    </span>
                    <span>{session.pages} pages</span>
                    <span>{session.clicks} clicks</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground">{session.startTime} · {session.date}</span>
                    {session.rage && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                        Rage click
                      </Badge>
                    )}
                    {session.deadClicks > 0 && !session.rage && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-warning border-warning/30">
                        {session.deadClicks} dead clicks
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Detail / Player */}
          <div className="lg:col-span-2 space-y-4 animate-fade-in-up stagger-3">
            {activeSession ? (
              <>
                {/* Player area */}
                <div className="rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
                  {/* Simulated replay viewport */}
                  <div className="relative bg-gradient-to-br from-muted/50 to-muted/20 aspect-video flex items-center justify-center">
                    {/* Simulated page content */}
                    <div className="absolute inset-4 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                      <div className="h-8 border-b border-border bg-muted/30 flex items-center px-3 gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                        <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                        <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                        <div className="ml-3 h-5 w-48 rounded bg-muted" />
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 w-32 rounded bg-muted/60" />
                        <div className="h-3 w-full rounded bg-muted/40" />
                        <div className="h-3 w-3/4 rounded bg-muted/40" />
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 rounded-lg bg-muted/30 border border-border/50" />
                          ))}
                        </div>
                        <div className="h-3 w-1/2 rounded bg-muted/40 mt-4" />
                        <div className="h-3 w-2/3 rounded bg-muted/40" />
                      </div>
                      {/* Simulated cursor */}
                      <div
                        className="absolute w-4 h-4 transition-all duration-300"
                        style={{
                          top: `${20 + progress * 0.6}%`,
                          left: `${30 + Math.sin(progress / 10) * 20}%`,
                        }}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-foreground drop-shadow-lg" fill="currentColor">
                          <path d="M5 3l14 8-6 2-4 6z" />
                        </svg>
                      </div>
                    </div>

                    {/* Current event overlay */}
                    {activeSession.events.map((event, i) => {
                      const eventPct = (i / (activeSession.events.length - 1)) * 100;
                      if (Math.abs(progress - eventPct) < 5) {
                        return (
                          <div key={i} className="absolute bottom-4 left-4 z-10">
                            <div className="bg-card/95 backdrop-blur border border-border rounded-lg shadow-elevated px-3 py-2 text-xs animate-fade-in">
                              <span className={cn("font-semibold", event.type === "rage" ? "text-destructive" : "text-foreground")}>
                                {event.time}
                              </span>
                              <span className="text-muted-foreground ml-2">{event.detail}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Playback controls */}
                  <div className="px-5 py-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setProgress(Math.max(0, progress - 10))}
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-full"
                        onClick={() => setPlaying(!playing)}
                      >
                        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setProgress(Math.min(100, progress + 10))}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>

                      {/* Progress bar */}
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pct = ((e.clientX - rect.left) / rect.width) * 100;
                          setProgress(pct);
                        }}
                      >
                        <div className="h-full rounded-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
                      </div>

                      <span className="text-xs font-mono text-muted-foreground w-14 text-right">
                        {activeSession.duration}
                      </span>
                    </div>

                    {/* Session meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        {activeSession.flag} {activeSession.country}
                      </span>
                      <span className="flex items-center gap-1">
                        {activeSession.device === "mobile" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                        {activeSession.browser} · {activeSession.os}
                      </span>
                      <span>{activeSession.pages} pages · {activeSession.clicks} clicks</span>
                      <span>Scroll: {activeSession.scrollDepth}%</span>
                    </div>
                  </div>
                </div>

                {/* Event timeline */}
                <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Event Timeline</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{activeSession.events.length} events recorded</p>
                  </div>
                  <div className="divide-y divide-border max-h-80 overflow-y-auto">
                    {activeSession.events.map((event, i) => {
                      const config = eventTypeConfig[event.type] || eventTypeConfig.click;
                      const Icon = config.icon;
                      const eventPct = (i / (activeSession.events.length - 1)) * 100;
                      const isActive = Math.abs(progress - eventPct) < 5;

                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors",
                            isActive ? "bg-accent/50" : "hover:bg-muted/20"
                          )}
                          onClick={() => setProgress(eventPct)}
                        >
                          <span className="text-xs font-mono text-muted-foreground w-10 shrink-0">{event.time}</span>
                          <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                            <Icon className={cn("h-3.5 w-3.5", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={cn("text-sm", event.type === "rage" ? "text-destructive font-semibold" : "text-foreground")}>
                              {event.detail}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
                            {event.type}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="rounded-2xl border border-border bg-card shadow-card flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                  <Play className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1.5">Select a session to replay</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Choose a recorded session from the list to watch user interactions, clicks, scrolls, and page navigation in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
