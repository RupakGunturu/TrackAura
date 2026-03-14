import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { fetchProjects } from "@/lib/projectsApi";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";
import { ProjectLockedState } from "@/components/ProjectLockedState";
import { useEffect } from "react";

export function DashboardLayout() {
  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
  const location = useLocation();
  const navigate = useNavigate();

  const { activeProjectIds, setActiveProjectIds } = useActiveProjectIds("");
  const selectedProject = activeProjectIds.split(",")[0] ?? "";
  const hasProjects = (data?.projects?.length ?? 0) > 0;
  const selectedProjectData = (data?.projects ?? []).find((project) => project.id === selectedProject);
  const hasIntegratedSelection = Boolean(selectedProjectData && selectedProjectData.stats.pageViews > 0);

  const projectAllowedPaths = ["/dashboard/projects", "/projects", "/dashboard/settings", "/dashboard/team"];
  const isProjectSetupPath = projectAllowedPaths.includes(location.pathname);
  const isEntryPath = ["/", "/dashboard"].includes(location.pathname);
  const shouldLockAnalytics = !hasProjects || !selectedProject || !hasIntegratedSelection;

  useEffect(() => {
    if (!isLoading && isEntryPath && shouldLockAnalytics) {
      navigate("/dashboard/projects", { replace: true });
    }
  }, [isLoading, isEntryPath, shouldLockAnalytics, navigate]);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          {/* Premium Top Header */}
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 sticky top-0 z-20">
            <SidebarTrigger className="h-5 w-5 text-gray-600 hover:text-gray-900" />
            <div className="h-5 w-px bg-gray-200" />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Premium Project Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Active Project:</label>
                <select
                  value={selectedProject}
                  onChange={(event) => {
                    setActiveProjectIds(event.target.value);
                  }}
                  className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 hover:border-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="">Select a project...</option>
                  {(data?.projects ?? []).map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Manage Link */}
              <Link 
                to="/dashboard/projects" 
                className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Manage
              </Link>

              {/* Live Indicator */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-gray-200">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-gray-600">Live</span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="max-w-screen-2xl mx-auto px-6 py-8">
              {!isLoading && shouldLockAnalytics && !isProjectSetupPath ? (
                <ProjectLockedState hasProjects={hasProjects} />
              ) : (
                <Outlet />
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
