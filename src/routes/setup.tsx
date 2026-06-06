import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "Setup — VendorBridge" }] }),
  component: () => <RequireAuth roles={["admin"]}><Page /></RequireAuth>,
});

function Page() {
  const { reset } = useStore();
  const nav = useNavigate();

  return (
    <AppLayout title="ERP Setup" subtitle="Configure your organization, region, and procurement policies">
      <form className="grid gap-4 lg:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.success("Configuration saved · System ready"); nav({ to: "/dashboard" }); }}>
        <Card>
          <CardHeader><CardTitle className="text-base">Organization</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Legal name</Label><Input defaultValue="VendorBridge Inc." /></div>
            <div className="space-y-1.5"><Label>Tax / GST ID</Label><Input defaultValue="29ABCDE1234F1Z5" /></div>
            <div className="space-y-1.5"><Label>Registered address</Label><Textarea rows={2} defaultValue="1100 Market St, San Francisco, CA 94103" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Region & Language</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Region</Label>
              <Select defaultValue="us"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="eu">European Union</SelectItem>
                  <SelectItem value="in">India</SelectItem>
                  <SelectItem value="apac">Asia Pacific</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Language</Label>
              <Select defaultValue="en"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Currency</Label>
              <Select defaultValue="usd"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="usd">USD</SelectItem><SelectItem value="eur">EUR</SelectItem><SelectItem value="gbp">GBP</SelectItem><SelectItem value="inr">INR</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Approval rules</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Officer auto-approve limit</Label><Input type="number" defaultValue={5000} /></div>
              <div className="space-y-1.5"><Label>Single-approver limit</Label><Input type="number" defaultValue={25000} /></div>
            </div>
            <div className="space-y-1.5"><Label>Multi-approver threshold</Label><Input type="number" defaultValue={100000} /></div>
            <div className="text-xs text-muted-foreground">POs above this amount require finance + executive approval.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Vendor policy</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Min vendors per RFQ</Label><Input type="number" defaultValue={3} /></div>
              <div className="space-y-1.5"><Label>Quotation validity (days)</Label><Input type="number" defaultValue={30} /></div>
            </div>
            <div className="space-y-1.5"><Label>Default payment terms</Label>
              <Select defaultValue="net30"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="net15">Net 15</SelectItem><SelectItem value="net30">Net 30</SelectItem><SelectItem value="net60">Net 60</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => { reset(); toast.success("Demo data reset"); }}><RotateCcw className="h-4 w-4" />Reset demo data</Button>
          <Button type="submit"><Check className="h-4 w-4" />Save & System Ready</Button>
        </div>
      </form>
    </AppLayout>
  );
}