import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Role } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — VendorBridge" }] }),
  component: LoginPage,
});

const QUICK: { role: Role; label: string; email: string; desc: string }[] = [
  { role: "admin", label: "Admin", email: "admin@vendorbridge.com", desc: "Full access" },
  { role: "officer", label: "Procurement Officer", email: "officer@vendorbridge.com", desc: "RFQs, POs, Invoices" },
  { role: "approver", label: "Approver", email: "approver@vendorbridge.com", desc: "Approve workflows" },
  { role: "vendor", label: "Vendor", email: "vendor@acme.com", desc: "Submit quotations" },
];

function LoginPage() {
  const { login, loginAs } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("officer@vendorbridge.com");
  const [password, setPassword] = useState("demo1234");
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "forgot") {
      toast.success("Password reset link sent (demo)");
      setMode("login");
      return;
    }
    if (mode === "signup") {
      toast.success("Account created. Welcome to VendorBridge.");
    }
    const res = login(email, password);
    if (!res.ok) return toast.error(res.error || "Login failed");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-10 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">V</div>
          <span className="font-semibold">VendorBridge</span>
        </div>
        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">Procurement that runs itself.</h2>
          <p className="text-sidebar-foreground/70 text-sm leading-relaxed">
            Manage vendors, RFQs, quotations, approvals, purchase orders and invoices in a single enterprise workspace.
          </p>
          <ul className="space-y-3 text-sm text-sidebar-foreground/80">
            {["Centralized vendor registry", "Quotation comparison & scoring", "Multi-step approval workflows", "Auto-generated POs & invoices"].map((t) => (
              <li key={t} className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-sidebar-primary" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 text-xs text-sidebar-foreground/50">© {new Date().getFullYear()} VendorBridge ERP</div>
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sidebar-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sidebar-accent/40 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div>
            <div className="lg:hidden mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">V</div>
              <span className="font-semibold">VendorBridge</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login" ? "Sign in to your procurement workspace." : mode === "signup" ? "Start managing vendors and RFQs." : "Enter your email to receive a reset link."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Jane Doe" required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">Forgot?</button>
                  )}
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            )}
            <Button type="submit" className="w-full">
              {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>New to VendorBridge? <button onClick={() => setMode("signup")} className="text-primary hover:underline">Create an account</button></>
            ) : (
              <button onClick={() => setMode("login")} className="text-primary hover:underline">Back to sign in</button>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Quick demo access</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {QUICK.map((q) => (
              <button key={q.role} type="button" onClick={() => { loginAs(q.role); nav({ to: "/dashboard" }); }}
                className="rounded-md border border-border p-3 text-left hover:border-primary hover:bg-primary-soft/30 transition">
                <div className="text-sm font-medium">{q.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{q.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}