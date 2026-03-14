import { useEffect, useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { Save, User, Shield, Bell, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

export default function AccountSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    company: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    bio: "",
  });

  const [notifications, setNotifications] = useState({
    emailDigests: true,
    anomalyAlerts: true,
    teamUpdates: false,
    productNews: false,
  });

  const initials = useMemo(() => {
    const parts = profile.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [profile.fullName]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      const email = data.user?.email ?? "";
      const metadata = data.user?.user_metadata ?? {};

      setProfile({
        fullName: String(metadata.full_name ?? email.split("@")[0] ?? "User"),
        email,
        company: String(metadata.company ?? ""),
        timezone: String(metadata.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone),
        bio: String(metadata.bio ?? ""),
      });

      const storageKey = `trackaura-notify-${data.user?.id ?? "anon"}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          setNotifications({ ...notifications, ...JSON.parse(raw) });
        } catch {
          // ignore malformed persisted settings
        }
      }

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const saveProfile = async () => {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: profile.fullName,
        company: profile.company,
        timezone: profile.timezone,
        bio: profile.bio,
      },
    });

    if (error) {
      toast({ title: "Failed to save profile", description: error.message, variant: "destructive" });
      return;
    }

    const { data } = await supabase.auth.getUser();
    const storageKey = `trackaura-notify-${data.user?.id ?? "anon"}`;
    localStorage.setItem(storageKey, JSON.stringify(notifications));

    toast({ title: "Settings saved", description: "Your profile and preferences were updated." });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <FilterBar title="Account Settings" subtitle="Manage your profile, security, and preferences" />
        <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading account settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilterBar title="Account Settings" subtitle="Manage your profile, security, and preferences" />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold flex items-center justify-center">
              {initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground truncate">{profile.fullName || "User"}</div>
              <div className="text-xs text-muted-foreground truncate">{profile.email || "Not signed in"}</div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-2"><User className="h-3.5 w-3.5" /> Profile from Supabase Auth</div>
            <div className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-2"><Shield className="h-3.5 w-3.5" /> Secure by Supabase</div>
            <div className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-2"><Bell className="h-3.5 w-3.5" /> Notification prefs persisted</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">Profile & Preferences</h3>
            <p className="text-xs text-muted-foreground mt-0.5">All values here are now dynamic from your account metadata.</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input
                  value={profile.fullName}
                  onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
                  className="mt-2 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                <input
                  value={profile.email}
                  readOnly
                  className="mt-2 w-full h-10 rounded-lg border border-input bg-muted/30 px-3 text-sm text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</label>
                <input
                  value={profile.company}
                  onChange={(event) => setProfile((prev) => ({ ...prev, company: event.target.value }))}
                  className="mt-2 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timezone</label>
                <div className="relative mt-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={profile.timezone}
                    onChange={(event) => setProfile((prev) => ({ ...prev, timezone: event.target.value }))}
                    className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))}
                className="mt-2 w-full h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications</label>
              <div className="mt-2 grid gap-2">
                {[
                  { key: "emailDigests", label: "Weekly email digests" },
                  { key: "anomalyAlerts", label: "Anomaly alerts" },
                  { key: "teamUpdates", label: "Team activity updates" },
                  { key: "productNews", label: "Product updates" },
                ].map((item) => {
                  const enabled = notifications[item.key as keyof typeof notifications];
                  return (
                    <label key={item.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                      <span>{item.label}</span>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() =>
                          setNotifications((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key as keyof typeof prev],
                          }))
                        }
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => void saveProfile()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
