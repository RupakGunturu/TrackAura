import React from "react";

/**
 * Mock webpage preview rendered behind the heatmap canvas.
 * Simulates a real landing page layout for the heatmap overlay.
 */
const WebpagePreview: React.FC = () => (
  <div className="w-full h-full bg-white select-none pointer-events-none overflow-hidden">
    {/* Navbar */}
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/90" />
        <span className="font-semibold text-sm text-gray-800 tracking-tight">
          Acme Inc
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-5 text-xs text-gray-500 font-medium">
        <span>Products</span>
        <span>Pricing</span>
        <span>Resources</span>
        <span>Docs</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">Sign in</span>
        <span className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-semibold">
          Get Started
        </span>
      </div>
    </div>

    {/* Hero Section */}
    <div className="flex flex-col items-center justify-center pt-12 pb-8 px-6 text-center">
      <span className="text-[10px] font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
        New Release v3.0
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight max-w-lg">
        Build better products with real-time analytics
      </h1>
      <p className="text-xs sm:text-sm text-gray-500 mt-3 max-w-md leading-relaxed">
        Understand your users. Optimize conversion. Ship with confidence. The
        analytics platform trusted by 10,000+ teams.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <span className="text-xs bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm">
          Start Free Trial
        </span>
        <span className="text-xs text-gray-600 px-4 py-2.5 rounded-xl font-medium border border-gray-200">
          Watch Demo
        </span>
      </div>
    </div>

    {/* Feature Cards */}
    <div className="grid grid-cols-3 gap-3 px-6 pb-6">
      {[
        {
          title: "User Analytics",
          desc: "Track behavior across every touchpoint",
          color: "bg-blue-50",
        },
        {
          title: "Conversion Funnels",
          desc: "Identify drop-offs and optimize flow",
          color: "bg-emerald-50",
        },
        {
          title: "A/B Testing",
          desc: "Run experiments with statistical rigor",
          color: "bg-amber-50",
        },
      ].map((f) => (
        <div
          key={f.title}
          className={`${f.color} rounded-xl p-4 border border-gray-100`}
        >
          <div className="w-6 h-6 rounded-lg bg-white/80 mb-2" />
          <h3 className="text-xs font-semibold text-gray-800">{f.title}</h3>
          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
            {f.desc}
          </p>
        </div>
      ))}
    </div>

    {/* Bottom CTA */}
    <div className="mx-6 mb-6 rounded-xl bg-gray-900 p-6 text-center">
      <h2 className="text-sm font-bold text-white">Ready to get started?</h2>
      <p className="text-[10px] text-gray-400 mt-1">
        Free 14-day trial. No credit card required.
      </p>
      <span className="inline-block text-xs bg-white text-gray-900 px-5 py-2 rounded-lg font-semibold mt-3">
        Sign Up for Free
      </span>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 mt-auto">
      <span className="text-[10px] text-gray-400">&copy; 2026 Acme Inc.</span>
      <div className="flex gap-4 text-[10px] text-gray-400">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Support</span>
      </div>
    </div>
  </div>
);

export default WebpagePreview;
