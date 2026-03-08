import { useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { cn } from "@/lib/utils";
import { UserPlus, MoreHorizontal, Shield, Mail, Crown, Search, Eye, Pencil, Trash2, ChevronDown, Users, UserCheck, Clock, ShieldCheck } from "lucide-react";

const teamMembers = [
  { id: 1, name: "John Doe", email: "john@trackaura.com", role: "Owner", initials: "JD", status: "active", lastActive: "Just now", joined: "Jan 3, 2025", color: "from-primary to-primary-glow" },
  { id: 2, name: "Sarah Chen", email: "sarah@trackaura.com", role: "Admin", initials: "SC", status: "active", lastActive: "2 min ago", joined: "Feb 14, 2025", color: "from-chart-5 to-warning" },
  { id: 3, name: "Mike Rivera", email: "mike@trackaura.com", role: "Editor", initials: "MR", status: "active", lastActive: "1 hour ago", joined: "Mar 8, 2025", color: "from-blue-500 to-blue-400" },
  { id: 4, name: "Emily Zhang", email: "emily@trackaura.com", role: "Viewer", initials: "EZ", status: "active", lastActive: "3 hours ago", joined: "Apr 21, 2025", color: "from-purple-500 to-purple-400" },
  { id: 5, name: "Alex Johnson", email: "alex@trackaura.com", role: "Editor", initials: "AJ", status: "invited", lastActive: "Pending", joined: "—", color: "from-rose-500 to-rose-400" },
];

const roleConfig: Record<string, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  Owner: { bg: "bg-primary/8", text: "text-primary", border: "border-primary/15", icon: Crown },
  Admin: { bg: "bg-chart-5/8", text: "text-chart-5", border: "border-chart-5/15", icon: Shield },
  Editor: { bg: "bg-blue-500/8", text: "text-blue-600", border: "border-blue-500/15", icon: Pencil },
  Viewer: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", icon: Eye },
};

export default function TeamManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtered = teamMembers.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Team Management" subtitle="Manage team members, roles, and access permissions" />
      </div>

      {/* Stats */}
      <div className="animate-fade-in-up stagger-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: "5", icon: Users, accent: "bg-accent text-primary" },
          { label: "Active Now", value: "3", icon: UserCheck, accent: "bg-accent text-primary" },
          { label: "Pending Invites", value: "1", icon: Mail, accent: "bg-chart-5/10 text-chart-5" },
          { label: "Roles Configured", value: "4", icon: ShieldCheck, accent: "bg-accent text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", s.accent)}>
                <s.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full h-11 rounded-xl border border-input bg-background pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["All", "Owner", "Admin", "Editor", "Viewer"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border",
                roleFilter === role
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              )}
            >
              {role}
            </button>
          ))}
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm shrink-0">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {/* Members table */}
      <div className="animate-fade-in-up stagger-4 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Member</th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Last Active</th>
                <th className="text-right px-6 py-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => {
                const rc = roleConfig[member.role];
                const RoleIcon = rc.icon;
                return (
                  <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <div className={cn("h-10 w-10 rounded-full bg-gradient-to-br flex items-center justify-center shadow-sm shrink-0", member.color)}>
                            <span className="text-xs font-bold text-white">{member.initials}</span>
                          </div>
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card",
                            member.status === "active" ? "bg-primary" : "bg-chart-5"
                          )} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border", rc.bg, rc.text, rc.border)}>
                        <RoleIcon className="h-3 w-3" />
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          member.status === "active" ? "bg-primary" : "bg-chart-5 animate-pulse"
                        )} />
                        <span className="text-xs font-medium text-muted-foreground capitalize">{member.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{member.joined}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground">{member.lastActive}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === member.id ? null : member.id); }}
                          className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors ml-auto"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                        {openMenu === member.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border bg-card shadow-elevated z-50 py-1.5 animate-scale-in">
                              {[
                                { label: "Change Role", icon: Shield },
                                { label: "Send Message", icon: Mail },
                                { label: "Remove Member", icon: Trash2, destructive: true },
                              ].map((action) => (
                                <button
                                  key={action.label}
                                  onClick={() => setOpenMenu(null)}
                                  className={cn(
                                    "w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors text-left",
                                    (action as any).destructive
                                      ? "text-destructive hover:bg-destructive/5"
                                      : "text-foreground hover:bg-muted"
                                  )}
                                >
                                  <action.icon className="h-3.5 w-3.5" />
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="text-muted-foreground/50 text-sm">No members match your filters</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role permissions */}
      <div className="animate-fade-in-up stagger-5 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-8 py-5 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Role Permissions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Overview of access levels for each role</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Permission</th>
                  {["Owner", "Admin", "Editor", "Viewer"].map((role) => {
                    const rc = roleConfig[role];
                    const RoleIcon = rc.icon;
                    return (
                      <th key={role} className="text-center px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border", rc.bg, rc.text, rc.border)}>
                          <RoleIcon className="h-2.5 w-2.5" />
                          {role}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {[
                  { perm: "View dashboards & reports", access: [true, true, true, true] },
                  { perm: "Create & edit dashboards", access: [true, true, true, false] },
                  { perm: "Manage events & tracking", access: [true, true, true, false] },
                  { perm: "Invite & manage members", access: [true, true, false, false] },
                  { perm: "Edit workspace settings", access: [true, true, false, false] },
                  { perm: "Billing & subscription", access: [true, false, false, false] },
                  { perm: "Delete workspace", access: [true, false, false, false] },
                ].map((row) => (
                  <tr key={row.perm} className="border-b border-border last:border-0 hover:bg-muted/15 transition-colors">
                    <td className="px-4 py-3.5 text-sm text-foreground">{row.perm}</td>
                    {row.access.map((has, i) => (
                      <td key={i} className="text-center px-4 py-3.5">
                        {has ? (
                          <div className="inline-flex h-5 w-5 rounded-full bg-primary/10 items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                        ) : (
                          <div className="inline-flex h-5 w-5 rounded-full bg-muted items-center justify-center">
                            <div className="h-1.5 w-4 rounded-full bg-border" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}