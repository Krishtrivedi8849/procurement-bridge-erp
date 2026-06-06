import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout, StatusBadge } from "@/components/AppLayout";
import { useStore, formatCurrency, formatDate } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders — VendorBridge" }] }),
  component: () => <RequireAuth><Page /></RequireAuth>,
});

function Page() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { purchaseOrders, vendors, rfqs, invoices, generateInvoice } = useStore();
  const list = user?.role === "vendor" ? purchaseOrders.filter((p) => p.vendorId === user.vendorId) : purchaseOrders;

  return (
    <AppLayout title="Purchase Orders" subtitle="Issued procurement orders to selected vendors">
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>RFQ</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((po) => {
              const vendor = vendors.find((v) => v.id === po.vendorId);
              const rfq = rfqs.find((r) => r.id === po.rfqId);
              const hasInvoice = invoices.some((i) => i.poId === po.id);
              return (
                <TableRow key={po.id}>
                  <TableCell className="font-mono text-sm font-medium">{po.poNumber}</TableCell>
                  <TableCell className="text-sm">{rfq?.title}</TableCell>
                  <TableCell className="text-sm">{vendor?.name}</TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(po.amount)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(po.createdAt)}</TableCell>
                  <TableCell><StatusBadge status={po.status} /></TableCell>
                  <TableCell className="text-right">
                    {(user?.role === "officer" || user?.role === "admin") && !hasInvoice && (
                      <Button size="sm" onClick={() => { const inv = generateInvoice(po.id); if (inv) { toast.success(`Created ${inv.invoiceNumber}`); nav({ to: "/invoices" }); } }}>
                        <Receipt className="h-4 w-4" />Generate invoice
                      </Button>
                    )}
                    {hasInvoice && <span className="text-xs text-muted-foreground">Invoice generated</span>}
                  </TableCell>
                </TableRow>
              );
            })}
            {list.length === 0 && <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No purchase orders yet. Approve a quotation to generate one.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>
    </AppLayout>
  );
}