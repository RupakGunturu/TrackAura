import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterBar } from "@/components/FilterBar";
import { Users, UserCheck, Mail, Shield } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { fetchProjects } from "@/lib/projectsApi";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";

export default function TeamManagementPage() {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const { activeProjectIds } = useActiveProjectIds("");
  const selectedProjectId = activeProjectIds.split(",")[0] ?? "";

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const selectedProject = useMemo(() => {
    return (projectsData?.projects ?? []).find((project) => project.id === selectedProjectId) ?? null;
  }, [projectsData?.projects, selectedProjectId]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const email = data.user?.email ?? "";
      const fullName = (data.user?.user_metadata?.full_name as string | undefined) || email.split("@")[0] || "User";
      setUserName(fullName);
      setUserEmail(email);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const members = useMemo(
    () => [
      {
        id: "current",
        name: userName,
        email: userEmail,
        role: "Owner",
        status: "active",
      },
    ],
    [userName, userEmail]
  );

  return (
    <div className="space-y-6">
      <FilterBar title="Team Management" subtitle="Dynamic team and project access overview" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Team Members", value: String(members.length), icon: Users },
          { label: "Active Members", value: String(members.filter((member) => member.status === "active").length), icon: UserCheck },
          { label: "Invites", value: "0", icon: Mail },
          { label: "Current Role", value: members[0]?.role ?? "-", icon: Shield },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Team Members</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Role</th>
              <th className="text-left px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-border last:border-0">
                <td className="px-6 py-3 font-medium">{member.name}</td>
                <td className="px-6 py-3 text-muted-foreground">{member.email || "Not signed in"}</td>
                <td className="px-6 py-3">{member.role}</td>
                <td className="px-6 py-3 capitalize">{member.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-sm font-semibold text-foreground">Project Access Snapshot</h3>
        {isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading project data...</p>
        ) : selectedProject ? (
          <div className="mt-3 grid gap-2 text-sm">
            <div>Project: <span className="font-semibold">{selectedProject.name}</span></div>
            <div>Website: <span className="text-muted-foreground">{selectedProject.website_url || "No website URL configured"}</span></div>
            <div>Tracked page views: <span className="font-semibold">{selectedProject.stats.pageViews.toLocaleString()}</span></div>
            <div>Tracked visitors: <span className="font-semibold">{selectedProject.stats.visitors.toLocaleString()}</span></div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Select a project to see access and activity details.</p>
        )}
      </div>
    </div>
  );
}
