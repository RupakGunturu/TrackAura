import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  Filter,
  Users,
  Activity,
  Lightbulb,
  ChevronRight,
  Zap,
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
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Real-Time", url: "/realtime", icon: Radio },
  { title: "Funnels", url: "/funnels", icon: Filter },
  { title: "Retention", url: "/retention", icon: Users },
  { title: "Performance", url: "/performance", icon: Activity },
  { title: "Insights", url: "/insights", icon: Lightbulb },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Logo */}
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-sidebar-accent-foreground tracking-tight truncate">
                Analytica
              </span>
              <span className="text-xs text-sidebar-foreground/60">Enterprise</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-3">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-3 mb-1">
              Navigation
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
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                        {isActive && !collapsed && (
                          <ChevronRight className="ml-auto h-3 w-3 opacity-60" />
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

      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        {!collapsed ? (
          <div className="rounded-lg bg-sidebar-accent px-3 py-2.5">
            <p className="text-xs font-medium text-sidebar-accent-foreground">Pro Plan</p>
            <p className="text-[11px] text-sidebar-foreground/60 mt-0.5">All features unlocked</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
