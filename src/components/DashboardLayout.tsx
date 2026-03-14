import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { fetchProjects } from "@/lib/projectsApi";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";

export function DashboardLayout() {
  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const { activeProjectIds, setActiveProjectIds } = useActiveProjectIds(import.meta.env.VITE_PROJECT_ID || "demo-project");
  const selectedProject = activeProjectIds.split(",")[0] ?? "";

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          {/* Top bar */}
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur px-4 sticky top-0 z-20">
            <SidebarTrigger className="h-7 w-7 text-muted-foreground hover:text-foreground" />
            <div className="h-4 w-px bg-border mx-1" />
            <span className="text-xs text-muted-foreground font-medium">TrackAura Analytics</span>
            <div className="ml-auto flex items-center gap-2">
              <select
                value={selectedProject}
                onChange={(event) => {
                  setActiveProjectIds(event.target.value);
                }}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground min-w-[160px]"
              >
                <option value="">Select project</option>
                {(data?.projects ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <Link to="/dashboard/projects" className="text-xs text-primary hover:underline">
                Manage
              </Link>
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
