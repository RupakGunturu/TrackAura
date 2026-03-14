import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Radio,
  Filter,
  Users,
  Activity,
  MousePointerClick,
  Flame,
  Play,
  FolderKanban,
  ChevronRight,
  Settings,
  LogOut,
  ChevronsUpDown,
  Lock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { fetchProjects } from "@/lib/projectsApi";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";
import { supabase } from "@/lib/supabaseClient";

const navItems = [
  { title: "Projects", url: "/dashboard/projects", icon: FolderKanban, requiresProject: false },
  { title: "Real-Time", url: "/realtime", icon: Radio, requiresProject: true },
  { title: "Funnels", url: "/funnels", icon: Filter, requiresProject: true },
  { title: "Retention", url: "/retention", icon: Users, requiresProject: true },
  { title: "Performance", url: "/performance", icon: Activity, requiresProject: true },
  { title: "Session Replay", url: "/sessions", icon: Play, requiresProject: true },
  { title: "Heatmaps", url: "/dashboard/heatmaps", icon: Flame, requiresProject: true },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const { activeProjectIds } = useActiveProjectIds("");
  const selectedProjectId = activeProjectIds.split(",")[0] ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
  const hasProjects = (data?.projects?.length ?? 0) > 0;
  const selectedProject = (data?.projects ?? []).find((project) => project.id === selectedProjectId);
  const hasIntegratedProject = Boolean(selectedProject && selectedProject.stats.pageViews > 0);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data: authData }) => {
      if (!mounted) return;
      const email = authData.user?.email ?? "";
      const fullName = (authData.user?.user_metadata?.full_name as string | undefined) || email.split("@")[0] || "User";
      setUserName(fullName);
      setUserEmail(email);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? "";
      const fullName = (session?.user?.user_metadata?.full_name as string | undefined) || email.split("@")[0] || "User";
      setUserName(fullName);
      setUserEmail(email);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const initials = useMemo(() => {
    const parts = userName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [userName]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="bg-white">
      {/* Premium Logo Section */}
      <SidebarHeader className="h-16 px-3 border-b border-gray-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-700 shadow-lg">
            <MousePointerClick className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-gray-900 tracking-tight truncate">
                TrackAura
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Analytics</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="py-4">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[11px] font-bold text-gray-700 uppercase tracking-widest px-4 mb-2">
              Analytics
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                const isLocked = !isLoading && item.requiresProject && (!hasProjects || !hasIntegratedProject);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild={!isLocked}
                      isActive={isActive}
                      tooltip={isLocked ? `${item.title} is locked until you create a project` : item.title}
                      className={cn(
                        "rounded-lg transition-all duration-150 h-10",
                        "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0",
                        collapsed ? "mx-1" : "mx-2",
                        isLocked && "opacity-55 cursor-not-allowed",
                        isActive
                          ? "bg-green-50 text-green-600 font-semibold shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      {isLocked ? (
                        <div className="flex items-center gap-2">
                          <item.icon className="h-5 w-5 shrink-0 text-gray-500" />
                          {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                          {!collapsed && <Lock className="ml-auto h-3.5 w-3.5 text-amber-600" />}
                        </div>
                      ) : (
                        <NavLink to={item.url} className="flex items-center gap-2">
                          <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-green-600" : "text-gray-600")} />
                          {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                          {isActive && !collapsed && (
                            <ChevronRight className="ml-auto h-4 w-4 text-green-600" />
                          )}
                        </NavLink>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Premium Profile Footer */}
      <SidebarFooter className="border-t border-gray-200 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-100 transition-colors text-left w-full",
              collapsed && "justify-center p-2"
            )}>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shrink-0 text-xs font-bold text-white shadow-sm">
                {initials}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{userName}</div>
                    <div className="text-[11px] text-gray-600 truncate">{userEmail || "Not signed in"}</div>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-gray-600 shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <div className="px-3 py-3 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900 truncate">{userName}</div>
              <div className="text-xs text-gray-600 truncate">{userEmail || "Not signed in"}</div>
            </div>
            <DropdownMenuItem className="gap-2 text-sm text-gray-700" asChild>
              <a href="/dashboard/settings">
                <Settings className="h-4 w-4" />
                Account Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm text-gray-700" asChild>
              <a href="/dashboard/team">
                <Users className="h-4 w-4" />
                Team Management
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm text-gray-700" asChild>
              <a href="/dashboard/projects">
                <FolderKanban className="h-4 w-4" />
                Projects
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50" asChild>
              <button onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
