import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, Zap, Users, Shield, ArrowRight, ChevronRight,
  Activity, Eye, Layers, LineChart, MousePointerClick, Play,
  Check, Star, Menu, X
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
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Monitor live user activity, sessions, and events as they happen across your entire platform." },
  { icon: MousePointerClick, title: "Click Heatmaps", desc: "Visualize exactly where users click, scroll, and engage on every page of your product." },
  { icon: Layers, title: "Conversion Funnels", desc: "Track user journeys from landing to conversion with detailed drop-off analysis at every step." },
  { icon: Activity, title: "Retention Cohorts", desc: "Understand how well you retain users over time with beautiful cohort heatmaps and trend analysis." },
  { icon: Eye, title: "Session Replay", desc: "Watch real user sessions to understand behavior, identify friction, and improve UX." },
  { icon: LineChart, title: "Performance Metrics", desc: "Track API response times, error rates, and infrastructure health in one unified dashboard." },
];

const steps = [
  { num: "01", title: "Install the Snippet", desc: "Add a single line of JavaScript to your website or app. Works with React, Next.js, Vue, and more.", highlight: "2 minutes setup" },
  { num: "02", title: "Data Flows In", desc: "TrackAura automatically captures page views, clicks, sessions, and custom events in real-time.", highlight: "Zero configuration" },
  { num: "03", title: "Explore Your Insights", desc: "Open your dashboard and explore heatmaps, funnels, retention cohorts, and session replays.", highlight: "Instant insights" },
  { num: "04", title: "Optimize & Grow", desc: "Use data-driven insights to improve user experience, boost conversions, and reduce churn.", highlight: "Measurable results" },
];

const testimonials = [
  { name: "Sarah K.", role: "Head of Product, Fintech", quote: "TrackAura replaced 3 tools for us. The cohort heatmap alone saved us hours of analysis every week.", avatar: "SK" },
  { name: "James L.", role: "CTO, SaaS Startup", quote: "The session replay and funnel analytics helped us increase our trial-to-paid conversion by 34%.", avatar: "JL" },
  { name: "Priya M.", role: "Growth Lead, E-commerce", quote: "Finally an analytics tool that's both powerful and beautiful. Our entire team actually uses it.", avatar: "PM" },
];

const pricing = [
  { name: "Starter", price: "Free", period: "forever", desc: "For side projects and small apps", features: ["5,000 sessions/mo", "7-day data retention", "Basic analytics", "1 team member"], cta: "Get Started", popular: false },
  { name: "Pro", price: "$29", period: "/month", desc: "For growing products and teams", features: ["50,000 sessions/mo", "12-month retention", "Heatmaps & replays", "5 team members", "Funnel analysis", "Priority support"], cta: "Start Free Trial", popular: true },
  { name: "Enterprise", price: "Custom", period: "", desc: "For large-scale operations", features: ["Unlimited sessions", "Unlimited retention", "All features", "Unlimited members", "SSO & SAML", "Dedicated support"], cta: "Contact Sales", popular: false },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            {["Features", "How It Works", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Log in
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
              Start Free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden border-t border-border bg-background px-6 pb-6"
          >
            <div className="flex flex-col gap-4 pt-4">
              {["Features", "How It Works", "Pricing"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <Link to="/" className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                Start Free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-60 right-1/4 w-72 h-72 bg-accent/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-accent/50 text-xs font-semibold text-primary mb-8"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Now in Public Beta — Free to get started
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            Understand your users.{" "}
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Grow faster.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            TrackAura gives you real-time analytics, heatmaps, session replays, and conversion funnels — all in one beautifully crafted dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground text-base font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
            >
              Start Free — No Card Required <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-border text-base font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Play className="h-4 w-4 text-primary" /> See How It Works
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-14 flex flex-col items-center gap-3"
          >
            <div className="flex -space-x-2">
              {["JD", "SK", "MR", "EZ", "AJ"].map((initials, i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-background">
                  {initials}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-chart-5 text-chart-5" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Trusted by <span className="font-semibold text-foreground">2,400+</span> teams worldwide</p>
          </motion.div>
        </div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl mx-auto mt-20 relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-3xl blur-2xl" />
          <div className="relative rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/40" />
                <div className="h-3 w-3 rounded-full bg-chart-5/40" />
                <div className="h-3 w-3 rounded-full bg-primary/40" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-lg bg-background border border-border text-[10px] text-muted-foreground font-mono">
                  app.trackaura.com/dashboard
                </div>
              </div>
            </div>
            {/* Dashboard mockup content */}
            <div className="p-6 grid grid-cols-4 gap-4">
              {["124.8K Users", "3,291 Sessions", "4.38% Conv.", "6m 42s Avg"].map((metric, i) => (
                <div key={i} className="rounded-xl border border-border bg-background p-4">
                  <div className="text-[10px] text-muted-foreground mb-1">{metric.split(" ").slice(1).join(" ")}</div>
                  <div className="text-lg font-bold text-foreground">{metric.split(" ")[0]}</div>
                  <div className="mt-2 h-8 rounded-lg bg-gradient-to-r from-primary/20 to-primary/5" />
                </div>
              ))}
              <div className="col-span-3 rounded-xl border border-border bg-background p-4 h-[160px]">
                <div className="text-[10px] text-muted-foreground mb-2">Daily Active Users</div>
                <div className="flex items-end gap-1 h-[120px]">
                  {Array.from({ length: 30 }, (_, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-primary to-primary/40" style={{ height: `${30 + Math.sin(i / 3) * 20 + i * 2}%` }} />
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-4 h-[160px]">
                <div className="text-[10px] text-muted-foreground mb-2">Devices</div>
                <div className="flex flex-col gap-2 mt-4">
                  {[{ l: "Web", w: "62%" }, { l: "Mobile", w: "31%" }, { l: "Tablet", w: "7%" }].map((d) => (
                    <div key={d.l}>
                      <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                        <span>{d.l}</span><span>{d.w}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: d.w }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="group rounded-2xl border border-border bg-card p-7 hover:shadow-elevated hover:border-primary/20 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-primary text-xs font-semibold mb-4">
              <Zap className="h-3 w-3" /> How It Works
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Up and running in{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">minutes</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No complex setup. No configuration nightmares. Just add one snippet and start exploring.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i}
                className="group flex flex-col md:flex-row items-start gap-6 p-8 rounded-2xl border border-border bg-card hover:shadow-elevated hover:border-primary/20 transition-all duration-300"
              >
                <div className="shrink-0">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md">
                    <span className="text-lg font-bold text-primary-foreground">{step.num}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-accent px-2.5 py-1 rounded-full">{step.highlight}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{step.desc}</p>
                </div>
                <div className="shrink-0 hidden md:flex items-center">
                  <ChevronRight className="h-5 w-5 text-border group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-primary text-xs font-semibold mb-4">
              <Users className="h-3 w-3" /> Testimonials
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Loved by{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">product teams</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl border border-border bg-card p-7 hover:shadow-elevated transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-chart-5 text-chart-5" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary-foreground">{t.avatar}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-primary text-xs font-semibold mb-4">
              <Shield className="h-3 w-3" /> Pricing
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">pricing</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground">
              Start free. Scale as you grow. No hidden fees.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-3 gap-6">
            {pricing.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i}
                className={cn(
                  "rounded-2xl border p-8 transition-all duration-300 relative",
                  plan.popular
                    ? "border-primary bg-card shadow-elevated scale-[1.02]"
                    : "border-border bg-card hover:shadow-elevated"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold transition-all",
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                    : "border border-border text-foreground hover:bg-muted"
                )}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-glow p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 tracking-tight">
              Ready to understand your users?
            </h2>
            <p className="text-base text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join 2,400+ teams using TrackAura to build better products. Start free — no credit card required.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-primary text-base font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              Get Started for Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold text-foreground">TrackAura</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Beautiful, powerful analytics for modern product teams.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security", "GDPR"] },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">{col.title}</div>
                <div className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <a key={link} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-muted-foreground">© 2026 TrackAura. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {["Twitter", "GitHub", "LinkedIn"].map((s) => (
                <a key={s} href="#" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}