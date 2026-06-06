import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout, StatusBadge } from "@/components/AppLayout";
import { useStore, formatCurrency, formatDate } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/quotations")({
  head: () => ({ meta: [{ title: "Quotations — VendorBridge" }] }),
  component: () => <RequireAuth><Page /></RequireAuth>,
});

function Page() {
  const { user } = useAuth();
  const { quotations, rfqs, vendors, addQuotation } = useStore();
  const [open, setOpen] = useState(false);
  const [rfqId, setRfqId] = useState<string>("");

  const isVendor = user?.role === "vendor";
  const list = isVendor ? quotations.filter((q) => q.vendorId === user!.vendorId) : quotations;
  const eligibleRFQs = rfqs.filter((r) => r.status === "published" && (!isVendor || r.vendorIds.includes(user!.vendorId!)));

  return (
    <AppLayout title="Quotations" subtitle={isVendor ? "Your submitted quotations" : "All vendor quotations across RFQs"}
      actions={isVendor && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" />Submit quotation</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit quotation</DialogTitle></DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!rfqId) return toast.error("Select an RFQ");
                const f = new FormData(e.currentTarget);
                const rfq = rfqs.find((r) => r.id === rfqId)!;
                const unitPrice = Number(f.get("unitPrice"));
                addQuotation({
                  rfqId,
                  vendorId: user!.vendorId!,
                  unitPrice,
                  totalPrice: unitPrice * rfq.quantity,
                  deliveryDays: Number(f.get("deliveryDays")),
                  comments: String(f.get("comments")),
                  status: "submitted",
                });
                toast.success("Quotation submitted");
                setOpen(false);
                setRfqId("");
              }}
            >
              <div className="space-y-1.5">
                <Label>RFQ</Label>
                <Select value={rfqId} onValueChange={setRfqId}>
                  <SelectTrigger><SelectValue placeholder="Choose RFQ to quote" /></SelectTrigger>
                  <SelectContent>{eligibleRFQs.map((r) => <SelectItem key={r.id} value={r.id}>{r.title} — {r.product}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Unit price (USD)</Label><Input name="unitPrice" type="number" step="0.01" required /></div>
                <div className="space-y-1.5"><Label>Delivery (days)</Label><Input name="deliveryDays" type="number" required defaultValue={7} /></div>
              </div>
              <div className="space-y-1.5"><Label>Comments</Label><Textarea name="comments" rows={3} placeholder="Warranty, terms, special conditions…" /></div>
              <DialogFooter><Button type="submit">Submit</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    >
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RFQ</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Unit price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((q) => {
              const rfq = rfqs.find((r) => r.id === q.rfqId);
              const vendor = vendors.find((v) => v.id === q.vendorId);
              return (
                <TableRow key={q.id}>
                  <TableCell><div className="font-medium">{rfq?.title}</div><div className="text-xs text-muted-foreground">{rfq?.product}</div></TableCell>
                  <TableCell className="text-sm">{vendor?.name}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(q.unitPrice)}</TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(q.totalPrice)}</TableCell>
                  <TableCell className="text-sm">{q.deliveryDays} days</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(q.createdAt)}</TableCell>
                  <TableCell><StatusBadge status={q.status} /></TableCell>
                </TableRow>
              );
            })}
            {list.length === 0 && <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No quotations yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </AppLayout>
  );
}