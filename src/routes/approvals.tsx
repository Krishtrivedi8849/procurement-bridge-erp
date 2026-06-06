import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout, StatusBadge } from "@/components/AppLayout";
import { useStore, formatCurrency, formatDateTime } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals — VendorBridge" }] }),
  component: () => <RequireAuth roles={["admin", "officer", "approver"]}><Page /></RequireAuth>,
});

function Page() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { approvals, quotations, rfqs, vendors, decideApproval, generatePO } = useStore();
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("pending");

  const filtered = approvals.filter((a) => tab === "all" ? true : a.status === tab);

  return (
    <AppLayout title="Approval Workflow" subtitle="Review selected quotations and authorize procurement">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({approvals.filter(a => a.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvals.filter(a => a.status === "approved").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4 space-y-3">
          {filtered.length === 0 && <Card><CardContent className="py-16 text-center text-sm text-muted-foreground">No approvals in this view.</CardContent></Card>}
          {filtered.map((a) => {
            const quote = quotations.find((q) => q.id === a.quotationId)!;
            const rfq = rfqs.find((r) => r.id === a.rfqId)!;
            const vendor = vendors.find((v) => v.id === quote.vendorId)!;
            return (
              <Card key={a.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start gap-6">
                    <div className="flex items-start gap-3 min-w-64">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary"><ShieldCheck className="h-5 w-5" /></div>
                      <div>
                        <div className="font-medium">{rfq.title}</div>
                        <div className="text-xs text-muted-foreground">Vendor: {vendor.name}</div>
                        <div className="text-xs text-muted-foreground">Requested {formatDateTime(a.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div><div className="text-xs text-muted-foreground">Amount</div><div className="font-semibold">{formatCurrency(quote.totalPrice)}</div></div>
                      <div><div className="text-xs text-muted-foreground">Delivery</div><div className="font-semibold">{quote.deliveryDays} days</div></div>
                      <div><div className="text-xs text-muted-foreground">Status</div><div><StatusBadge status={a.status} /></div></div>
                    </div>
                  </div>
                  {a.status === "pending" ? (
                    user?.role === "approver" || user?.role === "admin" ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] items-start">
                        <Textarea placeholder="Add remarks (optional)" value={remarks[a.id] || ""} onChange={(e) => setRemarks((r) => ({ ...r, [a.id]: e.target.value }))} rows={2} />
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => { decideApproval(a.id, "rejected", remarks[a.id] || "", user!.id); toast.error("Rejected"); }}><X className="h-4 w-4" />Reject</Button>
                          <Button onClick={() => { decideApproval(a.id, "approved", remarks[a.id] || "", user!.id); toast.success("Approved"); }}><Check className="h-4 w-4" />Approve</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-muted-foreground">Awaiting approver action.</div>
                    )
                  ) : (
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-xs text-muted-foreground">
                        {a.remarks && <span className="italic">"{a.remarks}" — </span>}
                        Decided {a.decidedAt ? formatDateTime(a.decidedAt) : ""}
                      </div>
                      {a.status === "approved" && (user?.role === "officer" || user?.role === "admin") && (
                        <Button size="sm" onClick={() => { const po = generatePO(a.id); if (po) { toast.success(`Generated ${po.poNumber}`); nav({ to: "/purchase-orders" }); } }}>Generate PO</Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}