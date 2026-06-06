import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout, StatusBadge } from "@/components/AppLayout";
import { useStore, formatCurrency } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Award, TrendingDown, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/comparison")({
  head: () => ({ meta: [{ title: "Comparison — VendorBridge" }] }),
  component: () => <RequireAuth roles={["admin", "officer"]}><Page /></RequireAuth>,
});

function Page() {
  const nav = useNavigate();
  const { rfqs, quotations, vendors, selectQuotation } = useStore();
  const published = rfqs.filter((r) => r.status === "published" || r.status === "awarded");
  const [rfqId, setRfqId] = useState<string>(published[0]?.id || "");
  const [sort, setSort] = useState<"price" | "delivery" | "rating">("price");

  const rows = useMemo(() => {
    const list = quotations.filter((q) => q.rfqId === rfqId).map((q) => {
      const v = vendors.find((vd) => vd.id === q.vendorId)!;
      return { ...q, vendor: v };
    });
    if (sort === "price") list.sort((a, b) => a.totalPrice - b.totalPrice);
    if (sort === "delivery") list.sort((a, b) => a.deliveryDays - b.deliveryDays);
    if (sort === "rating") list.sort((a, b) => b.vendor.rating - a.vendor.rating);
    return list;
  }, [rfqId, sort, quotations, vendors]);

  const lowest = rows.reduce((min, r) => (r.totalPrice < (min?.totalPrice ?? Infinity) ? r : min), rows[0]);
  const rfq = rfqs.find((r) => r.id === rfqId);

  return (
    <AppLayout title="Quotation Comparison" subtitle="Compare vendor responses and select the winning bid">
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <Select value={rfqId} onValueChange={setRfqId}>
            <SelectTrigger className="w-80"><SelectValue placeholder="Select RFQ" /></SelectTrigger>
            <SelectContent>{published.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as any)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Sort by lowest price</SelectItem>
              <SelectItem value="delivery">Sort by fastest delivery</SelectItem>
              <SelectItem value="rating">Sort by best rated</SelectItem>
            </SelectContent>
          </Select>
          {rfq && <div className="ml-auto text-xs text-muted-foreground">Comparing {rows.length} quote{rows.length === 1 ? "" : "s"} for <span className="font-medium text-foreground">{rfq.product}</span> ({rfq.quantity} {rfq.unit})</div>}
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <Card className="mt-4"><CardContent className="py-16 text-center text-sm text-muted-foreground">No quotations submitted for this RFQ yet.</CardContent></Card>
      ) : (
        <div className="mt-4 grid gap-3">
          {rows.map((r) => {
            const isLowest = r.id === lowest?.id;
            return (
              <Card key={r.id} className={isLowest ? "border-accent ring-1 ring-accent/40" : ""}>
                <CardContent className="p-5 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3 min-w-56">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary text-sm font-semibold">{r.vendor.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</div>
                    <div>
                      <div className="font-medium flex items-center gap-2">{r.vendor.name}{isLowest && <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-foreground"><Award className="h-3 w-3" />Best price</span>}</div>
                      <div className="text-xs text-muted-foreground">{r.vendor.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm"><TrendingDown className="h-4 w-4 text-muted-foreground" /><div><div className="text-xs text-muted-foreground">Total</div><div className="font-semibold">{formatCurrency(r.totalPrice)}</div></div></div>
                  <div className="flex items-center gap-1 text-sm"><Clock className="h-4 w-4 text-muted-foreground" /><div><div className="text-xs text-muted-foreground">Delivery</div><div className="font-semibold">{r.deliveryDays} days</div></div></div>
                  <div className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 text-accent fill-accent" /><div><div className="text-xs text-muted-foreground">Rating</div><div className="font-semibold">{r.vendor.rating.toFixed(1)}</div></div></div>
                  <div className="flex-1 min-w-32 text-xs text-muted-foreground italic">{r.comments || "—"}</div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    {r.status === "submitted" && (
                      <Button size="sm" onClick={() => { selectQuotation(r.id); toast.success("Sent for approval"); nav({ to: "/approvals" }); }}>Select & approve</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}