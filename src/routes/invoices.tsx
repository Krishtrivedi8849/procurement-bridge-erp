import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout, StatusBadge } from "@/components/AppLayout";
import { useStore, formatCurrency, formatDate } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, Mail, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Invoice } from "@/lib/store";

export const Route = createFileRoute("/invoices")({
  head: () => ({ meta: [{ title: "Invoices — VendorBridge" }] }),
  component: () => <RequireAuth><Page /></RequireAuth>,
});

function Page() {
  const { user } = useAuth();
  const { invoices, vendors, purchaseOrders, rfqs, updateInvoiceStatus } = useStore();
  const [preview, setPreview] = useState<Invoice | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const list = user?.role === "vendor" ? invoices.filter((i) => i.vendorId === user.vendorId) : invoices;

  function printInvoice(inv: Invoice) {
    const vendor = vendors.find((v) => v.id === inv.vendorId)!;
    const po = purchaseOrders.find((p) => p.id === inv.poId)!;
    const rfq = rfqs.find((r) => r.id === po.rfqId)!;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`
      <html><head><title>${inv.invoiceNumber}</title>
      <style>body{font-family:Inter,system-ui,sans-serif;padding:48px;color:#0f172a}h1{margin:0;font-size:28px}table{width:100%;border-collapse:collapse;margin-top:24px}td,th{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:14px}.muted{color:#64748b;font-size:13px}.right{text-align:right}.total{font-weight:600;font-size:18px}</style>
      </head><body>
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div><h1>VendorBridge</h1><div class="muted">Procurement ERP · USA</div></div>
        <div class="right"><div style="font-size:22px;font-weight:600">INVOICE</div><div class="muted">${inv.invoiceNumber}</div><div class="muted">${formatDate(inv.createdAt)}</div></div>
      </div>
      <div style="margin-top:32px;display:flex;justify-content:space-between">
        <div><div class="muted">Bill to</div><div style="font-weight:600;margin-top:4px">${vendor.name}</div><div class="muted">${vendor.address}</div><div class="muted">${vendor.email}</div></div>
        <div class="right"><div class="muted">PO Number</div><div style="font-weight:600">${po.poNumber}</div><div class="muted" style="margin-top:8px">GST: ${vendor.gst}</div></div>
      </div>
      <table><thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Unit</th><th class="right">Amount</th></tr></thead>
      <tbody><tr><td>${rfq.product}<div class="muted">${rfq.title}</div></td><td class="right">${rfq.quantity}</td><td class="right">${formatCurrency(inv.subtotal / rfq.quantity)}</td><td class="right">${formatCurrency(inv.subtotal)}</td></tr></tbody>
      </table>
      <div style="margin-top:24px;display:flex;justify-content:flex-end"><table style="width:280px">
        <tr><td class="muted">Subtotal</td><td class="right">${formatCurrency(inv.subtotal)}</td></tr>
        <tr><td class="muted">Tax (18%)</td><td class="right">${formatCurrency(inv.tax)}</td></tr>
        <tr><td class="total">Total</td><td class="right total">${formatCurrency(inv.total)}</td></tr>
      </table></div>
      <div class="muted" style="margin-top:48px">Thank you for doing business with VendorBridge.</div>
      </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  return (
    <AppLayout title="Invoices" subtitle="Generate, print, and dispatch vendor invoices">
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>PO</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((inv) => {
              const vendor = vendors.find((v) => v.id === inv.vendorId);
              const po = purchaseOrders.find((p) => p.id === inv.poId);
              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-sm font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-sm">{po?.poNumber}</TableCell>
                  <TableCell className="text-sm">{vendor?.name}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(inv.subtotal)}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(inv.tax)}</TableCell>
                  <TableCell className="text-sm font-semibold">{formatCurrency(inv.total)}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setPreview(inv)}><FileText className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => printInvoice(inv)}><Printer className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setPreview(inv); setEmailOpen(true); }}><Mail className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { printInvoice(inv); toast.success("Opening PDF view"); }}><Download className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {list.length === 0 && <TableRow><TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No invoices yet. Generate one from a Purchase Order.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={!!preview && !emailOpen} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          {preview && (() => {
            const vendor = vendors.find((v) => v.id === preview.vendorId)!;
            const po = purchaseOrders.find((p) => p.id === preview.poId)!;
            const rfq = rfqs.find((r) => r.id === po.rfqId)!;
            return (
              <div>
                <DialogHeader><DialogTitle>{preview.invoiceNumber}</DialogTitle></DialogHeader>
                <div className="mt-4 rounded-lg border border-border p-6 bg-card">
                  <div className="flex items-start justify-between">
                    <div><div className="text-lg font-semibold">VendorBridge</div><div className="text-xs text-muted-foreground">Procurement ERP</div></div>
                    <div className="text-right"><div className="text-xs text-muted-foreground">Invoice date</div><div className="font-medium">{formatDate(preview.createdAt)}</div></div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
                    <div><div className="text-xs text-muted-foreground">Bill to</div><div className="font-medium">{vendor.name}</div><div className="text-xs text-muted-foreground">{vendor.address}</div><div className="text-xs text-muted-foreground">{vendor.email}</div></div>
                    <div className="text-right"><div className="text-xs text-muted-foreground">PO Number</div><div className="font-medium font-mono">{po.poNumber}</div></div>
                  </div>
                  <div className="mt-6 rounded-md border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                        <tr><th className="p-2 text-left">Item</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Amount</th></tr>
                      </thead>
                      <tbody><tr className="border-t border-border"><td className="p-2">{rfq.product} <span className="text-xs text-muted-foreground">— {rfq.title}</span></td><td className="p-2 text-right">{rfq.quantity}</td><td className="p-2 text-right">{formatCurrency(preview.subtotal)}</td></tr></tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <div className="w-64 space-y-1 text-sm">
                      <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(preview.subtotal)}</span></div>
                      <div className="flex justify-between text-muted-foreground"><span>Tax (18%)</span><span>{formatCurrency(preview.tax)}</span></div>
                      <div className="flex justify-between font-semibold text-base border-t border-border pt-1 mt-1"><span>Total</span><span>{formatCurrency(preview.total)}</span></div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => printInvoice(preview)}><Printer className="h-4 w-4" />Print</Button>
                  <Button variant="outline" onClick={() => setEmailOpen(true)}><Mail className="h-4 w-4" />Send email</Button>
                  <Button onClick={() => { updateInvoiceStatus(preview.id, "paid"); toast.success("Marked as paid"); setPreview(null); }}>Mark paid</Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send invoice via email</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (preview) updateInvoiceStatus(preview.id, "sent"); toast.success("Invoice sent"); setEmailOpen(false); setPreview(null); }}>
            <div className="space-y-1.5"><Label>Recipient</Label><Input defaultValue={preview ? vendors.find((v) => v.id === preview.vendorId)?.email : ""} required /></div>
            <div className="space-y-1.5"><Label>Subject</Label><Input defaultValue={preview ? `Invoice ${preview.invoiceNumber} from VendorBridge` : ""} required /></div>
            <div className="space-y-1.5"><Label>Message</Label><Input defaultValue="Please find your invoice attached." /></div>
            <DialogFooter><Button type="submit"><Mail className="h-4 w-4" />Send</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}