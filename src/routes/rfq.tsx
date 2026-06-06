import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout, StatusBadge } from "@/components/AppLayout";
import { useStore, formatDate } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Paperclip } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/rfq")({
  head: () => ({ meta: [{ title: "RFQ — VendorBridge" }] }),
  component: () => <RequireAuth><Page /></RequireAuth>,
});

function Page() {
  const { user } = useAuth();
  const { rfqs, vendors, addRFQ, quotations } = useStore();
  const [open, setOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const myList = user?.role === "vendor"
    ? rfqs.filter((r) => r.vendorIds.includes(user.vendorId!) && r.status !== "draft")
    : rfqs;

  return (
    <AppLayout title="Request for Quotation" subtitle="Create RFQs and invite vendors to quote"
      actions={user?.role !== "vendor" && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" />Create RFQ</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New Request for Quotation</DialogTitle></DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const status = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("data-action") === "draft" ? "draft" : "published";
                addRFQ({
                  title: String(f.get("title")),
                  product: String(f.get("product")),
                  quantity: Number(f.get("quantity")),
                  unit: String(f.get("unit")),
                  description: String(f.get("description")),
                  deadline: new Date(String(f.get("deadline"))).toISOString(),
                  status: status as any,
                  vendorIds: selectedVendors,
                  createdBy: user?.id || "u2",
                });
                toast.success(status === "draft" ? "RFQ saved as draft" : "RFQ published to vendors");
                setOpen(false);
                setSelectedVendors([]);
              }}
            >
              <div className="space-y-1.5"><Label>RFQ title</Label><Input name="title" required placeholder="Q3 Office Laptops" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-2"><Label>Product / Service</Label><Input name="product" required /></div>
                <div className="space-y-1.5"><Label>Quantity</Label><Input name="quantity" type="number" required defaultValue={1} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Unit</Label><Input name="unit" required defaultValue="units" /></div>
                <div className="space-y-1.5"><Label>Deadline</Label><Input name="deadline" type="date" required defaultValue={new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)} /></div>
              </div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea name="description" rows={3} placeholder="Specifications, expectations, terms…" /></div>
              <div className="space-y-1.5">
                <Label>Attachment</Label>
                <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground"><Paperclip className="h-3.5 w-3.5" />Drag-drop a spec sheet, PDF, or CSV (demo)</div>
              </div>
              <div className="space-y-1.5">
                <Label>Invite vendors</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto rounded-md border border-border p-2">
                  {vendors.filter((v) => v.status === "active").map((v) => (
                    <label key={v.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer">
                      <Checkbox checked={selectedVendors.includes(v.id)} onCheckedChange={(c) => setSelectedVendors((s) => c ? [...s, v.id] : s.filter((x) => x !== v.id))} />
                      <span>{v.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{v.category}</span>
                    </label>
                  ))}
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="submit" data-action="draft" variant="outline">Save as draft</Button>
                <Button type="submit" data-action="publish">Publish RFQ</Button>
              </DialogFooter>
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
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Vendors</TableHead>
              <TableHead>Quotes</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myList.map((r) => {
              const qCount = quotations.filter((q) => q.rfqId === r.id).length;
              return (
                <TableRow key={r.id}>
                  <TableCell><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground">Created {formatDate(r.createdAt)}</div></TableCell>
                  <TableCell className="text-sm">{r.product}</TableCell>
                  <TableCell className="text-sm">{r.quantity} {r.unit}</TableCell>
                  <TableCell className="text-sm">{r.vendorIds.length}</TableCell>
                  <TableCell className="text-sm">{qCount}</TableCell>
                  <TableCell className="text-sm">{formatDate(r.deadline)}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell className="text-right">
                    {user?.role === "vendor" ? (
                      <Link to="/quotations"><Button variant="outline" size="sm">Submit quote</Button></Link>
                    ) : (
                      <Link to="/comparison"><Button variant="ghost" size="sm">Compare</Button></Link>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {myList.length === 0 && <TableRow><TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No RFQs yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </AppLayout>
  );
}