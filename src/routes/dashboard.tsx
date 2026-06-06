import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout, StatusBadge } from "@/components/AppLayout";
import { useStore, formatCurrency, formatDate } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, UserPlus, Receipt, TrendingUp, ShieldCheck, Users, Package } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — VendorBridge" }] }),
  component: () => <RequireAuth><Page /></RequireAuth>,
});

function Stat({ icon: Icon, label, value, delta }: { icon: any; label: string; value: string; delta?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary"><Icon className="h-4 w-4" /></div>
          {delta && <span className="text-xs font-medium text-accent">{delta}</span>}
        </div>
        <div className="mt-4">
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Page() {
  const { vendors, rfqs, quotations, approvals, purchaseOrders, invoices } = useStore();

  const trend = useMemo(() => ([
    { m: "Jan", spend: 24000 }, { m: "Feb", spend: 32000 }, { m: "Mar", spend: 28500 },
    { m: "Apr", spend: 41000 }, { m: "May", spend: 37500 }, { m: "Jun", spend: 52000 },
  ]), []);
  const vendorPerf = useMemo(() => vendors.slice(0, 5).map((v) => ({ name: v.name.split(" ")[0], rating: v.rating })), [vendors]);

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const activeRFQs = rfqs.filter((r) => r.status === "published");

  return (
    <AppLayout title="Dashboard" subtitle="Procurement performance at a glance"
      actions={
        <>
          <Link to="/rfq"><Button variant="outline" size="sm"><FileText className="h-4 w-4" />Create RFQ</Button></Link>
          <Link to="/vendors"><Button variant="outline" size="sm"><UserPlus className="h-4 w-4" />Add Vendor</Button></Link>
          <Link to="/invoices"><Button size="sm"><Receipt className="h-4 w-4" />Generate Invoice</Button></Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Active vendors" value={String(vendors.filter((v) => v.status === "active").length)} delta="+2 this month" />
        <Stat icon={FileText} label="Active RFQs" value={String(activeRFQs.length)} delta="+1 this week" />
        <Stat icon={ShieldCheck} label="Pending approvals" value={String(pendingApprovals.length)} />
        <Stat icon={TrendingUp} label="Monthly spend" value={formatCurrency(52000)} delta="+38.6%" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Procurement trends</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.92 0.01 250)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.5 0.03 256)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.03 256)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
                <Line type="monotone" dataKey="spend" stroke="oklch(0.38 0.16 258)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Vendor performance</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPerf} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.92 0.01 250)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="oklch(0.5 0.03 256)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.03 256)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 5]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
                <Bar dataKey="rating" fill="oklch(0.68 0.16 156)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Recent purchase orders</CardTitle><Link to="/purchase-orders" className="text-xs text-primary hover:underline">View all</Link></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {purchaseOrders.slice(0, 5).map((po) => {
                const vendor = vendors.find((v) => v.id === po.vendorId);
                return (
                  <div key={po.id} className="flex items-center justify-between px-6 py-3 text-sm">
                    <div className="flex items-center gap-3"><Package className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium">{po.poNumber}</div><div className="text-xs text-muted-foreground">{vendor?.name}</div></div></div>
                    <div className="text-right"><div className="font-medium">{formatCurrency(po.amount)}</div><div className="text-xs text-muted-foreground">{formatDate(po.createdAt)}</div></div>
                  </div>
                );
              })}
              {purchaseOrders.length === 0 && <div className="px-6 py-10 text-center text-sm text-muted-foreground">No purchase orders yet. Approve a quotation to generate one.</div>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Recent invoices</CardTitle><Link to="/invoices" className="text-xs text-primary hover:underline">View all</Link></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {invoices.slice(0, 5).map((inv) => {
                const vendor = vendors.find((v) => v.id === inv.vendorId);
                return (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-3 text-sm">
                    <div className="flex items-center gap-3"><Receipt className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium">{inv.invoiceNumber}</div><div className="text-xs text-muted-foreground">{vendor?.name}</div></div></div>
                    <div className="flex items-center gap-3"><StatusBadge status={inv.status} /><div className="text-right text-sm font-medium">{formatCurrency(inv.total)}</div></div>
                  </div>
                );
              })}
              {invoices.length === 0 && <div className="px-6 py-10 text-center text-sm text-muted-foreground">No invoices yet.</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Active RFQs</CardTitle><Link to="/rfq" className="text-xs text-primary hover:underline">View all</Link></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {activeRFQs.slice(0, 4).map((r) => {
                const qCount = quotations.filter((q) => q.rfqId === r.id).length;
                return (
                  <div key={r.id} className="flex items-center justify-between px-6 py-3 text-sm">
                    <div><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{r.product} · {r.quantity} {r.unit}</div></div>
                    <div className="flex items-center gap-4"><span className="text-xs text-muted-foreground">{qCount} quotes</span><StatusBadge status={r.status} /></div>
                  </div>
                );
              })}
              {activeRFQs.length === 0 && <div className="px-6 py-10 text-center text-sm text-muted-foreground">No active RFQs.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}