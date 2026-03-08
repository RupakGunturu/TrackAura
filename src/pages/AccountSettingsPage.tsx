import { useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { Camera, Save, Shield, Bell, Globe, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const tabs = [
  { id: "profile", label: "Profile", icon: Camera },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: Globe },
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

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your changes have been applied." });
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Account Settings" subtitle="Manage your profile, security, and preferences" />
      </div>

      <div className="animate-fade-in-up stagger-2 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Left tabs */}
        <div className="rounded-2xl border border-border bg-card p-3 shadow-card h-fit">
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left",
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className={cn("h-4 w-4", activeTab === tab.id && "text-primary")} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          {activeTab === "profile" && (
            <div>
              <div className="px-8 py-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Update your personal details and public profile</p>
              </div>
              <div className="p-8 space-y-8">
                {/* Avatar section */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-primary-foreground">JD</span>
                    </div>
                    <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors">
                      <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{profile.name}</div>
                    <div className="text-xs text-muted-foreground">{profile.email}</div>
                    <span className="inline-flex mt-2 text-[10px] font-bold uppercase tracking-wider text-primary bg-accent px-2.5 py-1 rounded-full">
                      {profile.role}
                    </span>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", value: profile.name, key: "name" },
                    { label: "Email Address", value: profile.email, key: "email" },
                    { label: "Company", value: profile.company, key: "company" },
                    { label: "Timezone", value: profile.timezone, key: "timezone" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</label>
                      <input
                        className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
                        value={field.value}
                        onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
                  <textarea
                    className="w-full h-24 rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <div className="px-8 py-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Security</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Manage passwords and authentication</p>
              </div>
              <div className="p-8 space-y-6">
                {[
                  { title: "Change Password", desc: "Update your password regularly for better security", action: "Update", icon: Key },
                  { title: "Two-Factor Authentication", desc: "Add an extra layer of security to your account", action: "Enable", icon: Shield },
                  { title: "Active Sessions", desc: "You're logged in on 2 devices", action: "Manage", icon: Globe },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between p-5 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                        <item.icon className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors">
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <div className="px-8 py-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Choose what alerts you receive</p>
              </div>
              <div className="p-8 space-y-5">
                {[
                  { title: "Email Digests", desc: "Weekly summary of your analytics", enabled: true },
                  { title: "Anomaly Alerts", desc: "Get notified of unusual traffic spikes", enabled: true },
                  { title: "Team Updates", desc: "When team members make changes", enabled: false },
                  { title: "Product News", desc: "New features and updates from TrackAura", enabled: false },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                    <div className={cn(
                      "h-6 w-11 rounded-full relative cursor-pointer transition-colors",
                      item.enabled ? "bg-primary" : "bg-muted"
                    )}>
                      <div className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                        item.enabled ? "translate-x-5" : "translate-x-0.5"
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div>
              <div className="px-8 py-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Preferences</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Customize your dashboard experience</p>
              </div>
              <div className="p-8 space-y-6">
                {[
                  { label: "Language", value: "English (US)" },
                  { label: "Date Format", value: "MM/DD/YYYY" },
                  { label: "Default Dashboard", value: "Overview" },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div className="text-sm font-medium text-foreground">{pref.label}</div>
                    <div className="px-4 py-2 rounded-lg bg-muted text-xs font-semibold text-muted-foreground">{pref.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
