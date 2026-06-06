import { type ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/lib/auth";
import { Search, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppLayout({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const { user } = useAuth();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4">
            <SidebarTrigger />
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">VendorBridge</span>
              <span>/</span>
              <span>{title}</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground w-64">
                <Search className="h-3.5 w-3.5" />
                <span>Search vendors, RFQs, POs…</span>
              </div>
              <button className="relative rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
              </button>
              <Badge variant="outline" className="capitalize hidden sm:inline-flex">{user?.role}</Badge>
            </div>
          </header>
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                  {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    active: "bg-accent-soft text-accent-foreground border-transparent",
    approved: "bg-accent-soft text-accent-foreground border-transparent",
    published: "bg-primary-soft text-primary border-transparent",
    submitted: "bg-primary-soft text-primary border-transparent",
    selected: "bg-accent-soft text-accent-foreground border-transparent",
    issued: "bg-primary-soft text-primary border-transparent",
    paid: "bg-accent-soft text-accent-foreground border-transparent",
    sent: "bg-primary-soft text-primary border-transparent",
    pending: "bg-yellow-100 text-yellow-900 border-transparent",
    draft: "bg-muted text-muted-foreground border-transparent",
    rejected: "bg-red-100 text-red-700 border-transparent",
    inactive: "bg-muted text-muted-foreground border-transparent",
    closed: "bg-muted text-muted-foreground border-transparent",
    awarded: "bg-accent-soft text-accent-foreground border-transparent",
    fulfilled: "bg-accent-soft text-accent-foreground border-transparent",
    cancelled: "bg-red-100 text-red-700 border-transparent",
    success: "bg-accent-soft text-accent-foreground border-transparent",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${map[s] || "bg-muted text-muted-foreground border-transparent"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}