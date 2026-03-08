import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, Zap, ArrowRight, ChevronRight,
  Activity, Eye, Layers, LineChart, MousePointerClick, Play,
  Code2, Copy, Check, Terminal, Menu, X, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
};

const features = [
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Monitor live user activity, sessions, and events as they happen across your entire platform.", link: "/dashboard/realtime" },
  { icon: MousePointerClick, title: "Click Heatmaps", desc: "Visualize exactly where users click, scroll, and engage on every page of your product.", link: "/dashboard/heatmaps" },
  { icon: Layers, title: "Conversion Funnels", desc: "Track user journeys from landing to conversion with detailed drop-off analysis at every step.", link: "/dashboard/funnels" },
  { icon: Activity, title: "Retention Cohorts", desc: "Understand how well you retain users over time with beautiful cohort heatmaps and trend analysis.", link: "/dashboard/retention" },
  { icon: Eye, title: "Session Replay", desc: "Watch real user sessions to understand behavior, identify friction, and improve UX.", link: "/dashboard/sessions" },
  { icon: LineChart, title: "Performance Metrics", desc: "Track API response times, error rates, and infrastructure health in one unified dashboard.", link: "/dashboard/performance" },
];

const integrationSteps = [
  {
    step: 1,
    title: "Install the SDK",
    desc: "Add TrackAura to your project with a single command.",
    code: `npm install @trackaura/sdk`,
    lang: "bash",
  },
  {
    step: 2,
    title: "Initialize in your app",
    desc: "Add 3 lines to your entry file — that's it.",
    code: `import { TrackAura } from '@trackaura/sdk';

TrackAura.init({
  projectId: 'YOUR_PROJECT_ID',
  trackClicks: true,
  trackSessions: true,
  heatmaps: true,
});`,
    lang: "javascript",
  },
  {
    step: 3,
    title: "Track custom events",
    desc: "Optionally log custom events for deeper insights.",
    code: `// Track a conversion event
TrackAura.track('purchase_completed', {
  plan: 'pro',
  value: 29.00,
  currency: 'USD',
});

// Identify users
TrackAura.identify(userId, {
  name: 'Jane Doe',
  email: 'jane@company.com',
  plan: 'pro',
});`,
    lang: "javascript",
  },
];

const frameworks = [
  { name: "React", color: "from-blue-400 to-blue-600" },
  { name: "Next.js", color: "from-foreground to-foreground" },
  { name: "Vue", color: "from-emerald-400 to-emerald-600" },
  { name: "Angular", color: "from-red-400 to-red-600" },
  { name: "Svelte", color: "from-orange-400 to-orange-600" },
  { name: "Vanilla JS", color: "from-yellow-400 to-yellow-600" },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const handleCopy = (code: string, step: number) => {
    navigator.clipboard.writeText(code);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">TrackAura</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "Integration", "How It Works"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Dashboard
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="md:hidden border-t border-border bg-background px-6 pb-6">
            <div className="flex flex-col gap-4 pt-4">
              {["Features", "Integration", "How It Works"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>{item}</a>
              ))}
              <Link to="/" className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-28 pb-12 md:pt-40 md:pb-20 px-6 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsl(158,64%,35%,0.08),transparent_70%)]" />
          <div className="absolute top-32 -left-32 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(158,64%,52%,0.06),transparent_60%)]" />
          <div className="absolute top-48 -right-32 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(152,76%,94%,0.4),transparent_60%)]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(hsl(220,20%,10%) 1px, transparent 1px), linear-gradient(90deg, hsl(220,20%,10%) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-accent/60 text-xs font-semibold text-primary mb-6">
                <Sparkles className="h-3 w-3" />
                Product Analytics Reimagined
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
                See what your users{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">actually do</span>
                  <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.6 }}
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-glow rounded-full origin-left" />
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
                className="text-base md:text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Real-time analytics, heatmaps, session replays, and conversion funnels. Add one snippet — get complete visibility into user behavior.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link to="/"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25">
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#integration"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  <Code2 className="h-4 w-4 text-primary" /> View Integration
                </a>
              </motion.div>

              {/* Quick install */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-border max-w-md">
                <Terminal className="h-4 w-4 text-primary shrink-0" />
                <code className="text-xs font-mono text-muted-foreground flex-1 truncate">npm install @trackaura/sdk</code>
                <button onClick={() => handleCopy("npm install @trackaura/sdk", -1)}
                  className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors shrink-0">
                  {copiedStep === -1 ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                </button>
              </motion.div>

              {/* Framework pills */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                className="flex flex-wrap items-center gap-2 mt-6">
                <span className="text-[10px] text-muted-foreground mr-1">Works with</span>
                {frameworks.map((fw) => (
                  <span key={fw.name} className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-border bg-card text-foreground">
                    {fw.name}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Live dashboard preview */}
            <motion.div initial={{ opacity: 0, x: 40, rotateY: -5 }} animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="relative hidden lg:block" style={{ perspective: 1000 }}>
              <div className="absolute -inset-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
                    <div className="h-2.5 w-2.5 rounded-full bg-chart-5/40" />
                    <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-3 py-0.5 rounded-md bg-background border border-border text-[9px] text-muted-foreground font-mono">
                      app.trackaura.com/dashboard
                    </div>
                  </div>
                </div>
                {/* Sidebar + content mockup */}
                <div className="flex">
                  {/* Mini sidebar */}
                  <div className="w-[52px] border-r border-border bg-muted/10 py-4 flex flex-col items-center gap-3">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                      <Zap className="h-3 w-3 text-primary-foreground" />
                    </div>
                    {[BarChart3, Activity, Layers, Eye, LineChart, MousePointerClick].map((Icon, i) => (
                      <div key={i} className={cn("h-7 w-7 rounded-lg flex items-center justify-center", i === 0 ? "bg-accent" : "hover:bg-muted/50")}>
                        <Icon className={cn("h-3 w-3", i === 0 ? "text-primary" : "text-muted-foreground/50")} />
                      </div>
                    ))}
                  </div>
                  {/* Main content */}
                  <div className="flex-1 p-4 space-y-3">
                    {/* KPI row */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "Users", val: "124.8K", trend: "+12.4%", up: true },
                        { label: "Sessions", val: "3,291", trend: "+5.7%", up: true },
                        { label: "Conv.", val: "4.38%", trend: "-0.6%", up: false },
                        { label: "Avg Time", val: "6m 42s", trend: "+1m", up: true },
                      ].map((m, i) => (
                        <div key={i} className="rounded-lg border border-border bg-background p-2.5">
                          <div className="text-[8px] text-muted-foreground">{m.label}</div>
                          <div className="text-sm font-bold text-foreground mt-0.5">{m.val}</div>
                          <div className={cn("text-[8px] font-semibold mt-0.5", m.up ? "text-primary" : "text-destructive")}>{m.trend}</div>
                        </div>
                      ))}
                    </div>
                    {/* Chart area */}
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="text-[8px] text-muted-foreground mb-2">Daily Active Users — Last 30 Days</div>
                      <div className="flex items-end gap-[3px] h-[100px]">
                        {Array.from({ length: 30 }, (_, i) => {
                          const h = 25 + Math.sin(i / 3) * 18 + i * 2 + Math.random() * 8;
                          return (
                            <div key={i} className="flex-1 rounded-t-sm" style={{
                              height: `${h}%`,
                              background: `linear-gradient(to top, hsl(158, 64%, 35%), hsl(158, 64%, 52%, 0.5))`,
                            }} />
                          );
                        })}
                      </div>
                    </div>
                    {/* Bottom row */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Mini heatmap */}
                      <div className="rounded-lg border border-border bg-background p-3">
                        <div className="text-[8px] text-muted-foreground mb-2">Retention Heatmap</div>
                        <div className="grid grid-cols-4 gap-1">
                          {[100, 72, 58, 41, 100, 69, 54, 38, 100, 75, 61, 44, 100, 68, 52, 36].map((v, i) => (
                            <div key={i} className="h-5 rounded-sm flex items-center justify-center"
                              style={{ backgroundColor: `hsl(158, ${30 + v * 0.3}%, ${85 - v * 0.45}%)` }}>
                              <span className="text-[6px] font-bold" style={{ color: v > 55 ? "white" : "hsl(220,20%,10%)" }}>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Mini funnel */}
                      <div className="rounded-lg border border-border bg-background p-3">
                        <div className="text-[8px] text-muted-foreground mb-2">Conversion Funnel</div>
                        <div className="space-y-1">
                          {[{ l: "Visitors", w: "100%" }, { l: "Signups", w: "34%" }, { l: "Active", w: "15%" }].map((s) => (
                            <div key={s.l}>
                              <div className="flex justify-between text-[7px] text-muted-foreground mb-0.5">
                                <span>{s.l}</span><span>{s.w}</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: s.w }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, duration: 0.4 }}
                className="absolute -bottom-4 -left-4 px-4 py-2.5 rounded-xl bg-card border border-border shadow-elevated flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Live Users</div>
                  <div className="text-sm font-bold text-foreground">3,291 <span className="text-primary text-[10px]">●</span></div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4, duration: 0.4 }}
                className="absolute -top-3 -right-3 px-3 py-2 rounded-xl bg-card border border-primary/20 shadow-elevated flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-semibold text-foreground">+12.4% this week</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-primary text-xs font-semibold mb-4">
              <BarChart3 className="h-3 w-3" /> Features
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">understand users</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One platform. Every insight. No context-switching between tools.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i}>
                <Link to={f.link} className="group block rounded-2xl border border-border bg-card p-7 hover:shadow-elevated hover:border-primary/20 transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-border group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── INTEGRATION / CODE ─── */}
      <section id="integration" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-primary text-xs font-semibold mb-4">
              <Code2 className="h-3 w-3" /> Integration
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Add to your app in{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">3 steps</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One package. A few lines of code. Full analytics power.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="space-y-8">
            {integrationSteps.map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} custom={i} className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
                {/* Description */}
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-primary-foreground">{s.step}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Code block */}
                <div className="rounded-2xl border border-border bg-foreground overflow-hidden shadow-elevated">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
                        <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
                        <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      </div>
                      <span className="text-[10px] text-white/40 font-mono ml-2">{s.lang === "bash" ? "terminal" : "app.tsx"}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(s.code, s.step)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
                    >
                      {copiedStep === s.step ? (
                        <>
                          <Check className="h-3 w-3 text-primary" />
                          <span className="text-[10px] text-primary font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-white/50" />
                          <span className="text-[10px] text-white/50 font-medium">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-5 overflow-x-auto">
                    <code className="text-[13px] leading-relaxed font-mono">
                      {s.code.split("\n").map((line, li) => {
                        const isComment = line.trim().startsWith("//");
                        const isKeyword = /^(import|from|const|export)/.test(line.trim());
                        const isString = /['"]/.test(line) && !isComment;
                        return (
                          <div key={li} className="flex">
                            <span className="w-8 text-right pr-4 text-white/20 select-none text-[11px]">{li + 1}</span>
                            <span className={cn(
                              isComment ? "text-white/30 italic" :
                              isKeyword ? "text-blue-300" :
                              isString ? "text-emerald-300" :
                              "text-white/80"
                            )}>
                              {line || " "}
                            </span>
                          </div>
                        );
                      })}
                    </code>
                  </pre>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Supported frameworks */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 text-center">
            <p className="text-xs text-muted-foreground mb-4">Works with any JavaScript framework</p>
            <div className="flex flex-wrap justify-center gap-3">
              {frameworks.map((fw) => (
                <div key={fw.name} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:shadow-card transition-all">
                  <div className={cn("h-5 w-5 rounded-md bg-gradient-to-br flex items-center justify-center", fw.color)}>
                    <span className="text-[8px] font-bold text-white">{fw.name[0]}</span>
                  </div>
                  <span className="text-xs font-medium text-foreground">{fw.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-primary text-xs font-semibold mb-4">
              <Play className="h-3 w-3" /> How It Works
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              From zero to insights in{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">minutes</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[31px] top-8 bottom-8 w-px bg-gradient-to-b from-primary via-primary/30 to-transparent hidden md:block" />

            <div className="space-y-6">
              {[
                { num: "01", title: "Install the SDK", desc: "Run npm install @trackaura/sdk — supports React, Next.js, Vue, Angular, Svelte, and vanilla JS.", tag: "2 minutes" },
                { num: "02", title: "Initialize & Configure", desc: "Call TrackAura.init() with your project ID. Auto-captures page views, clicks, scroll depth, and sessions.", tag: "3 lines of code" },
                { num: "03", title: "Explore the Dashboard", desc: "Open your TrackAura dashboard to see real-time analytics, heatmaps, funnels, and cohort retention — all populated instantly.", tag: "Instant" },
                { num: "04", title: "Track Custom Events", desc: "Use TrackAura.track() to log conversions, purchases, feature usage — anything that matters to your business.", tag: "Optional" },
              ].map((step, i) => (
                <motion.div key={step.num} variants={fadeUp} custom={i}
                  className="flex items-start gap-6 p-6 md:pl-0">
                  <div className="relative z-10 shrink-0">
                    <div className="h-[62px] w-[62px] rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md">
                      <span className="text-lg font-bold text-primary-foreground">{step.num}</span>
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-accent px-2 py-0.5 rounded-full">{step.tag}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-glow p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }} />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 tracking-tight">
              Start understanding your users today
            </h2>
            <p className="text-base text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Add TrackAura in under 2 minutes. No credit card. No complex setup. Just insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-primary text-base font-semibold hover:bg-white/90 transition-colors shadow-lg">
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#integration"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-white/30 text-base font-medium text-primary-foreground hover:bg-white/10 transition-colors">
                <Code2 className="h-4 w-4" /> View Code
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">TrackAura</span>
            <span className="text-xs text-muted-foreground ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6">
            {["Documentation", "GitHub", "Privacy", "Terms"].map((link) => (
              <a key={link} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}