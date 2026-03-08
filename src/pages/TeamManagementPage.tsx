import { useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { cn } from "@/lib/utils";
import { UserPlus, MoreHorizontal, Shield, Mail, Crown, Search } from "lucide-react";

const teamMembers = [
  { id: 1, name: "John Doe", email: "john@trackaura.com", role: "Owner", initials: "JD", status: "active", lastActive: "Just now", color: "from-primary to-primary-glow" },
  { id: 2, name: "Sarah Chen", email: "sarah@trackaura.com", role: "Admin", initials: "SC", status: "active", lastActive: "2 min ago", color: "from-chart-5 to-warning" },
  { id: 3, name: "Mike Rivera", email: "mike@trackaura.com", role: "Editor", initials: "MR", status: "active", lastActive: "1 hour ago", color: "from-blue-500 to-blue-400" },
  { id: 4, name: "Emily Zhang", email: "emily@trackaura.com", role: "Viewer", initials: "EZ", status: "active", lastActive: "3 hours ago", color: "from-purple-500 to-purple-400" },
  { id: 5, name: "Alex Johnson", email: "alex@trackaura.com", role: "Editor", initials: "AJ", status: "invited", lastActive: "Pending", color: "from-rose-500 to-rose-400" },
];

const roleColors: Record<string, string> = {
  Owner: "bg-primary/10 text-primary border-primary/20",
  Admin: "bg-warning/10 text-warning border-warning/20",
  Editor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Viewer: "bg-muted text-muted-foreground border-border",
};

export default function TeamManagementPage() {
  const [search, setSearch] = useState("");
  
  const filtered = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Team Management" subtitle="Manage team members, roles, and permissions" />
      </div>

      {/* Stats row */}
      <div className="animate-fade-in-up stagger-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: "5", icon: "👥" },
          { label: "Active Now", value: "3", icon: "🟢" },
          { label: "Pending Invites", value: "1", icon: "✉️" },
          { label: "Roles Used", value: "4", icon: "🛡️" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              <span className="text-lg">{s.icon}</span>
            </div>
            <div className="text-2xl font-bold text-foreground tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search + Invite */}
      <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full h-11 rounded-xl border border-input bg-background pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm shrink-0">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {/* Members list */}
      <div className="animate-fade-in-up stagger-4 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Active</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm shrink-0", member.color)}>
                        <span className="text-xs font-bold text-white">{member.initials}</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border", roleColors[member.role])}>
                      {member.role === "Owner" && <Crown className="h-3 w-3" />}
                      {member.role === "Admin" && <Shield className="h-3 w-3" />}
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", member.status === "active" ? "bg-primary" : "bg-warning animate-pulse")} />
                      <span className="text-xs font-medium text-muted-foreground capitalize">{member.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{member.lastActive}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors ml-auto">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles legend */}
      <div className="animate-fade-in-up stagger-5 rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Role Permissions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { role: "Owner", perms: "Full access, billing, delete workspace" },
            { role: "Admin", perms: "Manage members, edit settings, view all data" },
            { role: "Editor", perms: "Create/edit dashboards, manage events" },
            { role: "Viewer", perms: "View dashboards and reports only" },
          ].map((r) => (
            <div key={r.role} className="p-4 rounded-xl border border-border bg-muted/20">
              <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border mb-2", roleColors[r.role])}>
                {r.role}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.perms}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
