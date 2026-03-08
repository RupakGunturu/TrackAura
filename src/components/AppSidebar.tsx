import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  Filter,
  Users,
  Activity,
  MousePointerClick,
  Play,
  ChevronRight,
  Settings,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
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

const navItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Real-Time", url: "/dashboard/realtime", icon: Radio },
  { title: "Funnels", url: "/dashboard/funnels", icon: Filter },
  { title: "Retention", url: "/dashboard/retention", icon: Users },
  { title: "Performance", url: "/dashboard/performance", icon: Activity },
  { title: "Heatmaps", url: "/dashboard/heatmaps", icon: MousePointerClick },
  { title: "Sessions", url: "/dashboard/sessions", icon: Play },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Logo */}
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm">
            <MousePointerClick className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground tracking-tight truncate">
                TrackAura
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Enterprise</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-3">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] uppercase tracking-widest px-3 mb-1">
              Analytics
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "mx-1 rounded-lg transition-all duration-150",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <NavLink to={item.url}>
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                        <span>{item.title}</span>
                        {isActive && !collapsed && (
                          <ChevronRight className="ml-auto h-3 w-3 text-primary opacity-60" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Profile section in footer */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 hover:bg-muted transition-colors text-left",
              collapsed && "justify-center px-0"
            )}>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-xs font-bold text-primary-foreground">JD</span>
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">John Doe</div>
                    <div className="text-[11px] text-muted-foreground truncate">john@trackaura.com</div>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <div className="px-3 py-2.5">
              <div className="text-sm font-semibold text-foreground">John Doe</div>
              <div className="text-xs text-muted-foreground">john@trackaura.com</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" asChild>
              <a href="/settings">
                <Settings className="h-4 w-4" />
                Account Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" asChild>
              <a href="/team">
                <Users className="h-4 w-4" />
                Team Management
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
