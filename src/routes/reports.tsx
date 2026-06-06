import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout } from "@/components/AppLayout";
import { useStore, formatCurrency } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileDown, FileSpreadsheet } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — VendorBridge" }] }),
  component: () => <RequireAuth roles={["admin", "officer"]}><Page /></RequireAuth>,
});

const COLORS = ["oklch(0.38 0.16 258)", "oklch(0.68 0.16 156)", "oklch(0.55 0.15 258)", "oklch(0.75 0.16 75)", "oklch(0.5 0.1 256)"];

function Page() {
  const { vendors, purchaseOrders, invoices } = useStore();

  const spendByVendor = useMemo(() => {
    const map = new Map<string, number>();
    purchaseOrders.forEach((p) => map.set(p.vendorId, (map.get(p.vendorId) || 0) + p.amount));
    return Array.from(map.entries()).map(([id, total]) => ({
      name: vendors.find((v) => v.id === id)?.name.split(" ")[0] || "?",
      total,
    }));
  }, [purchaseOrders, vendors]);

  const monthly = useMemo(() => ([
    { m: "Jan", spend: 24000 }, { m: "Feb", spend: 32000 }, { m: "Mar", spend: 28500 },
    { m: "Apr", spend: 41000 }, { m: "May", spend: 37500 }, { m: "Jun", spend: 52000 },
  ]), []);

  const categoryShare = useMemo(() => {
    const map = new Map<string, number>();
    vendors.forEach((v) => map.set(v.category, (map.get(v.category) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [vendors]);

  const totalSpend = purchaseOrders.reduce((s, p) => s + p.amount, 0);
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);

  function exportCSV() {
    const rows = [["Invoice", "Vendor", "Subtotal", "Tax", "Total", "Status"]];
    invoices.forEach((i) => { const v = vendors.find((vd) => vd.id === i.vendorId); rows.push([i.invoiceNumber, v?.name || "", String(i.subtotal), String(i.tax), String(i.total), i.status]); });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "procurement-report.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  return (
    <AppLayout title="Reports" subtitle="Procurement intelligence and vendor analytics"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={exportCSV}><FileSpreadsheet className="h-4 w-4" />CSV</Button>
          <Button variant="outline" size="sm" onClick={exportCSV}><FileDown className="h-4 w-4" />Excel</Button>
          <Button size="sm" onClick={() => window.print()}><Download className="h-4 w-4" />PDF</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground">Total procurement</div><div className="mt-1 text-2xl font-semibold">{formatCurrency(totalSpend)}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground">Paid invoices</div><div className="mt-1 text-2xl font-semibold">{formatCurrency(paid)}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground">Active vendors</div><div className="mt-1 text-2xl font-semibold">{vendors.filter((v) => v.status === "active").length}</div></CardContent></Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Monthly procurement trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.92 0.01 250)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.5 0.03 256)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.03 256)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
                <Bar dataKey="spend" fill="oklch(0.38 0.16 258)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Vendor category mix</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={48} outerRadius={84} paddingAngle={2}>
                  {categoryShare.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Vendor performance (spend)</CardTitle></CardHeader>
        <CardContent className="h-80">
          {spendByVendor.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No POs issued yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendByVendor} layout="vertical" margin={{ left: 24, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.92 0.01 250)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.5 0.03 256)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <YAxis type="category" dataKey="name" stroke="oklch(0.5 0.03 256)" fontSize={12} width={80} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="total" fill="oklch(0.68 0.16 156)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}