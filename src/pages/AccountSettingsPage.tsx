import { useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { Camera, Save, Shield, Bell, Globe, Key, User, Lock, Monitor, ChevronRight, LogOut, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const tabs = [
  { id: "profile", label: "Profile", desc: "Personal info", icon: User },
  { id: "security", label: "Security", desc: "Password & 2FA", icon: Shield },
  { id: "notifications", label: "Notifications", desc: "Alert preferences", icon: Bell },
  { id: "preferences", label: "Preferences", desc: "Display settings", icon: Globe },
];

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@trackaura.com",
    role: "Admin",
    company: "TrackAura Inc.",
    timezone: "UTC-5 (EST)",
    bio: "Product analytics enthusiast. Building better user experiences through data.",
  });
  const [notifications, setNotifications] = useState({
    emailDigests: true,
    anomalyAlerts: true,
    teamUpdates: false,
    productNews: false,
  });

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your changes have been applied successfully." });
  };

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Account Settings" subtitle="Manage your profile, security, and preferences" />
      </div>

      <div className="animate-fade-in-up stagger-2 grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar nav */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            {/* Profile card */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md">
                  <span className="text-lg font-bold text-primary-foreground">JD</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{profile.name}</div>
                  <div className="text-xs text-muted-foreground">{profile.email}</div>
                  <span className="inline-flex mt-1.5 text-[9px] font-bold uppercase tracking-widest text-primary bg-accent px-2 py-0.5 rounded-full">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group",
                    activeTab === tab.id
                      ? "bg-accent shadow-sm"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                    activeTab === tab.id ? "bg-primary/10" : "bg-muted"
                  )}>
                    <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm font-medium", activeTab === tab.id ? "text-foreground" : "text-muted-foreground")}>{tab.label}</div>
                    <div className="text-[10px] text-muted-foreground">{tab.desc}</div>
                  </div>
                  <ChevronRight className={cn("h-3.5 w-3.5 transition-colors shrink-0", activeTab === tab.id ? "text-primary" : "text-border")} />
                </button>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-destructive/20 bg-card shadow-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs font-semibold text-destructive">Danger Zone</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">Permanently delete your account and all associated data.</p>
            <button className="w-full py-2 rounded-lg border border-destructive/30 text-xs font-semibold text-destructive hover:bg-destructive/5 transition-colors">
              Delete Account
            </button>
          </div>
        </div>

        {/* Content panel */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div>
              <div className="px-8 py-6 border-b border-border">
                <h3 className="text-base font-semibold text-foreground">Profile Information</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Update your personal details and public profile</p>
              </div>
              <div className="p-8 space-y-8">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <span className="text-2xl font-bold text-primary-foreground">JD</span>
                    </div>
                    <button className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors">
                      <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Profile Photo</div>
                    <div className="text-xs text-muted-foreground mt-0.5">JPG, PNG or SVG. Max 2MB.</div>
                    <button className="mt-2 text-xs font-semibold text-primary hover:underline">Upload new photo</button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", value: profile.name, key: "name", type: "text" },
                    { label: "Email Address", value: profile.email, key: "email", type: "email" },
                    { label: "Company", value: profile.company, key: "company", type: "text" },
                    { label: "Timezone", value: profile.timezone, key: "timezone", type: "text" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</label>
                      <input
                        type={field.type}
                        className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        value={field.value}
                        onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
                  <textarea
                    className="w-full h-24 rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">{profile.bio.length}/200 characters</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">Last updated: Mar 5, 2026</span>
                  <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div>
              <div className="px-8 py-6 border-b border-border">
                <h3 className="text-base font-semibold text-foreground">Security</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Manage your password and authentication methods</p>
              </div>
              <div className="p-8 space-y-4">
                {[
                  { title: "Change Password", desc: "Last changed 45 days ago. We recommend updating regularly.", action: "Update", icon: Key, highlight: true },
                  { title: "Two-Factor Authentication", desc: "Protect your account with an extra layer of security.", action: "Enable", icon: Shield, highlight: false },
                  { title: "Active Sessions", desc: "Currently signed in on 2 devices.", action: "Manage", icon: Monitor, highlight: false },
                  { title: "Sign Out Everywhere", desc: "Sign out from all devices except the current one.", action: "Sign Out", icon: LogOut, highlight: false },
                ].map((item) => (
                  <div key={item.title} className={cn(
                    "flex items-center justify-between p-5 rounded-xl border transition-colors",
                    item.highlight ? "border-chart-5/20 bg-chart-5/5" : "border-border hover:bg-muted/20"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        item.highlight ? "bg-chart-5/10" : "bg-accent"
                      )}>
                        <item.icon className={cn("h-4 w-4", item.highlight ? "text-chart-5" : "text-primary")} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                          {item.title}
                          {item.highlight && <span className="text-[9px] font-bold uppercase tracking-wider text-chart-5 bg-chart-5/10 px-1.5 py-0.5 rounded-full">Recommended</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors shrink-0">
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div>
              <div className="px-8 py-6 border-b border-border">
                <h3 className="text-base font-semibold text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Control what alerts and updates you receive</p>
              </div>
              <div className="p-8 space-y-2">
                {[
                  { key: "emailDigests", title: "Weekly Email Digests", desc: "A summary of your analytics delivered every Monday", category: "Email" },
                  { key: "anomalyAlerts", title: "Anomaly Alerts", desc: "Get notified of unusual traffic spikes or drops", category: "Critical" },
                  { key: "teamUpdates", title: "Team Activity", desc: "When team members make changes to dashboards", category: "Activity" },
                  { key: "productNews", title: "Product Updates", desc: "New features and improvements from TrackAura", category: "Marketing" },
                ].map((item) => {
                  const enabled = notifications[item.key as keyof typeof notifications];
                  return (
                    <div key={item.key} className="flex items-center justify-between p-5 rounded-xl border border-border hover:bg-muted/15 transition-colors">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{item.title}</span>
                            <span className={cn(
                              "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                              item.category === "Critical" ? "text-destructive bg-destructive/10" : "text-muted-foreground bg-muted"
                            )}>{item.category}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleNotification(item.key)}
                        className={cn(
                          "h-6 w-11 rounded-full relative transition-colors shrink-0",
                          enabled ? "bg-primary" : "bg-input"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                          enabled ? "translate-x-5" : "translate-x-0.5"
                        )} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="px-8 pb-8">
                <div className="flex items-center justify-end pt-4 border-t border-border">
                  <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === "preferences" && (
            <div>
              <div className="px-8 py-6 border-b border-border">
                <h3 className="text-base font-semibold text-foreground">Preferences</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Customize your dashboard experience</p>
              </div>
              <div className="p-8 space-y-6">
                {[
                  { label: "Language", value: "English (US)", options: ["English (US)", "Spanish", "French", "German"] },
                  { label: "Date Format", value: "MM/DD/YYYY", options: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] },
                  { label: "Default Dashboard", value: "Overview", options: ["Overview", "Real-Time", "Funnels", "Retention"] },
                  { label: "Number Format", value: "1,234.56", options: ["1,234.56", "1.234,56"] },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between p-5 rounded-xl border border-border hover:bg-muted/15 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-foreground">{pref.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Currently set to {pref.value}</div>
                    </div>
                    <select className="px-4 py-2 rounded-lg border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer">
                      {pref.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="px-8 pb-8">
                <div className="flex items-center justify-end pt-4 border-t border-border">
                  <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}