import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, FileText, Receipt, BarChart3, ScrollText,
  ShieldCheck, ClipboardList, Scale, Settings, Box, LogOut,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/store";

type Item = { title: string; url: string; icon: typeof LayoutDashboard; roles: Role[] };

const main: Item[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["admin", "officer", "approver", "vendor"] },
  { title: "Vendors", url: "/vendors", icon: Users, roles: ["admin", "officer"] },
  { title: "RFQ", url: "/rfq", icon: FileText, roles: ["admin", "officer", "vendor"] },
  { title: "Quotations", url: "/quotations", icon: ClipboardList, roles: ["admin", "officer", "vendor"] },
  { title: "Comparison", url: "/comparison", icon: Scale, roles: ["admin", "officer"] },
  { title: "Approvals", url: "/approvals", icon: ShieldCheck, roles: ["admin", "officer", "approver"] },
  { title: "Purchase Orders", url: "/purchase-orders", icon: Box, roles: ["admin", "officer", "vendor"] },
  { title: "Invoices", url: "/invoices", icon: Receipt, roles: ["admin", "officer", "vendor"] },
];
const system: Item[] = [
  { title: "Activity Logs", url: "/activity", icon: ScrollText, roles: ["admin", "officer", "approver"] },
  { title: "Reports", url: "/reports", icon: BarChart3, roles: ["admin", "officer"] },
  { title: "Setup", url: "/setup", icon: Settings, roles: ["admin"] },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");
  const visible = (items: Item[]) => items.filter((i) => !user || i.roles.includes(user.role));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">V</div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">VendorBridge</span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Procurement ERP</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visible(main).map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visible(system).map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium">
            {user?.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </div>
          <div className="flex flex-1 flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</span>
            <span className="text-[10px] text-sidebar-foreground/60 capitalize">{user?.role}</span>
          </div>
          <button onClick={logout} className="text-sidebar-foreground/60 hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}