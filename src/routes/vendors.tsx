import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout, StatusBadge } from "@/components/AppLayout";
import { useStore, formatDate } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vendors")({
  head: () => ({ meta: [{ title: "Vendors — VendorBridge" }] }),
  component: () => <RequireAuth roles={["admin", "officer"]}><Page /></RequireAuth>,
});

function Page() {
  const { vendors, addVendor, updateVendor } = useStore();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(false);

  const categories = Array.from(new Set(vendors.map((v) => v.category)));
  const filtered = vendors.filter((v) =>
    (cat === "all" || v.category === cat) &&
    (v.name.toLowerCase().includes(query.toLowerCase()) || v.email.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <AppLayout title="Vendors" subtitle="Vendor registry, profiles and engagement history"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" />Register vendor</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register new vendor</DialogTitle></DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                addVendor({
                  name: String(f.get("name")),
                  category: String(f.get("category")),
                  gst: String(f.get("gst")),
                  email: String(f.get("email")),
                  phone: String(f.get("phone")),
                  address: String(f.get("address")),
                  rating: 4.0,
                  status: "active",
                });
                toast.success("Vendor registered");
                setOpen(false);
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Vendor name</Label><Input name="name" required /></div>
                <div className="space-y-1.5"><Label>Category</Label><Input name="category" placeholder="Hardware" required /></div>
                <div className="space-y-1.5"><Label>GST / Tax ID</Label><Input name="gst" required /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input name="email" type="email" required /></div>
                <div className="space-y-1.5"><Label>Phone</Label><Input name="phone" required /></div>
                <div className="space-y-1.5 col-span-2"><Label>Address</Label><Input name="address" required /></div>
              </div>
              <DialogFooter><Button type="submit">Register</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search vendors by name or email…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-primary text-xs font-semibold">{v.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</div>
                      <div><div className="font-medium">{v.name}</div><div className="text-xs text-muted-foreground">{v.address}</div></div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{v.category}</TableCell>
                  <TableCell className="text-xs font-mono">{v.gst}</TableCell>
                  <TableCell className="text-sm"><div>{v.email}</div><div className="text-xs text-muted-foreground">{v.phone}</div></TableCell>
                  <TableCell><span className="inline-flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-accent text-accent" />{v.rating.toFixed(1)}</span></TableCell>
                  <TableCell><StatusBadge status={v.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(v.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => { updateVendor(v.id, { status: v.status === "active" ? "inactive" : "active" }); toast.success("Status updated"); }}>
                      {v.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No vendors match your filters.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}