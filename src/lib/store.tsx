import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "officer" | "approver" | "vendor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  vendorId?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  gst: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface RFQ {
  id: string;
  title: string;
  product: string;
  quantity: number;
  unit: string;
  description: string;
  deadline: string;
  status: "draft" | "published" | "closed" | "awarded";
  vendorIds: string[];
  createdBy: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  comments: string;
  status: "submitted" | "selected" | "rejected";
  createdAt: string;
}

export interface Approval {
  id: string;
  quotationId: string;
  rfqId: string;
  status: "pending" | "approved" | "rejected";
  remarks: string;
  approverId?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  quotationId: string;
  rfqId: string;
  vendorId: string;
  amount: number;
  status: "issued" | "fulfilled" | "cancelled";
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poId: string;
  vendorId: string;
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid";
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  status: string;
  timestamp: string;
}

interface DataState {
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  approvals: Approval[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  logs: ActivityLog[];
  users: User[];
}

const STORAGE_KEY = "vendorbridge_data_v1";

const uid = () => Math.random().toString(36).slice(2, 10);
const nowIso = () => new Date().toISOString();

function seed(): DataState {
  const vendors: Vendor[] = [
    { id: "v1", name: "Acme Industrial Supplies", category: "Hardware", gst: "29ABCDE1234F1Z5", email: "sales@acme.com", phone: "+1 415 555 0101", address: "1100 Market St, SF", rating: 4.6, status: "active", createdAt: nowIso() },
    { id: "v2", name: "Northwind Logistics", category: "Logistics", gst: "07FGHIJ5678K2L9", email: "ops@northwind.com", phone: "+1 212 555 0144", address: "200 Park Ave, NY", rating: 4.2, status: "active", createdAt: nowIso() },
    { id: "v3", name: "Helix Office Solutions", category: "Office Supplies", gst: "33MNOPQ9012R3S4", email: "hello@helix.co", phone: "+1 312 555 0188", address: "55 Wacker Dr, Chicago", rating: 4.0, status: "active", createdAt: nowIso() },
    { id: "v4", name: "Vertex IT Distributors", category: "IT Hardware", gst: "27TUVWX3456Y7Z2", email: "biz@vertex.io", phone: "+1 408 555 0177", address: "300 Castro St, MV", rating: 4.8, status: "active", createdAt: nowIso() },
    { id: "v5", name: "BluePeak Manufacturing", category: "Manufacturing", gst: "19ZABCD7890E1F3", email: "rfq@bluepeak.com", phone: "+1 503 555 0199", address: "440 SW 6th, Portland", rating: 3.9, status: "inactive", createdAt: nowIso() },
  ];
  const users: User[] = [
    { id: "u1", name: "Alex Morgan", email: "admin@vendorbridge.com", role: "admin" },
    { id: "u2", name: "Priya Shah", email: "officer@vendorbridge.com", role: "officer" },
    { id: "u3", name: "David Chen", email: "approver@vendorbridge.com", role: "approver" },
    { id: "u4", name: "Acme Vendor", email: "vendor@acme.com", role: "vendor", vendorId: "v1" },
  ];
  const rfqs: RFQ[] = [
    { id: "r1", title: "Office Laptops Q1", product: "Dell Latitude 7440", quantity: 25, unit: "units", description: "Standard issue laptops for new hires.", deadline: new Date(Date.now() + 7 * 86400000).toISOString(), status: "published", vendorIds: ["v1", "v4"], createdBy: "u2", createdAt: nowIso() },
    { id: "r2", title: "Warehouse Forklifts", product: "Electric Forklift 2T", quantity: 4, unit: "units", description: "Replacement units for SF warehouse.", deadline: new Date(Date.now() + 14 * 86400000).toISOString(), status: "published", vendorIds: ["v1", "v5"], createdBy: "u2", createdAt: nowIso() },
  ];
  const quotations: Quotation[] = [
    { id: "q1", rfqId: "r1", vendorId: "v1", unitPrice: 1280, totalPrice: 32000, deliveryDays: 10, comments: "Includes 3-yr warranty.", status: "submitted", createdAt: nowIso() },
    { id: "q2", rfqId: "r1", vendorId: "v4", unitPrice: 1199, totalPrice: 29975, deliveryDays: 14, comments: "Bulk discount applied.", status: "submitted", createdAt: nowIso() },
  ];
  return { vendors, rfqs, quotations, approvals: [], purchaseOrders: [], invoices: [], logs: [], users };
}

function loadState(): DataState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const s = seed();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  return s;
}

interface StoreContextValue extends DataState {
  addVendor: (v: Omit<Vendor, "id" | "createdAt">) => void;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  addRFQ: (r: Omit<RFQ, "id" | "createdAt">) => RFQ;
  updateRFQ: (id: string, patch: Partial<RFQ>) => void;
  addQuotation: (q: Omit<Quotation, "id" | "createdAt">) => Quotation;
  selectQuotation: (quotationId: string) => Approval;
  decideApproval: (id: string, status: "approved" | "rejected", remarks: string, approverId: string) => void;
  generatePO: (approvalId: string) => PurchaseOrder | null;
  generateInvoice: (poId: string) => Invoice | null;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  log: (entry: Omit<ActivityLog, "id" | "timestamp">) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(() => (typeof window === "undefined" ? seed() : loadState()));

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const log: StoreContextValue["log"] = (entry) => {
    setState((s) => ({ ...s, logs: [{ id: uid(), timestamp: nowIso(), ...entry }, ...s.logs].slice(0, 200) }));
  };

  const value: StoreContextValue = {
    ...state,
    addVendor: (v) => {
      const vendor: Vendor = { id: uid(), createdAt: nowIso(), ...v };
      setState((s) => ({ ...s, vendors: [vendor, ...s.vendors] }));
      log({ user: "Officer", action: "Created vendor", target: vendor.name, status: "success" });
    },
    updateVendor: (id, patch) => {
      setState((s) => ({ ...s, vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)) }));
    },
    addRFQ: (r) => {
      const rfq: RFQ = { id: uid(), createdAt: nowIso(), ...r };
      setState((s) => ({ ...s, rfqs: [rfq, ...s.rfqs] }));
      log({ user: "Officer", action: r.status === "published" ? "Published RFQ" : "Saved RFQ draft", target: rfq.title, status: r.status });
      return rfq;
    },
    updateRFQ: (id, patch) => setState((s) => ({ ...s, rfqs: s.rfqs.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
    addQuotation: (q) => {
      const quotation: Quotation = { id: uid(), createdAt: nowIso(), ...q };
      setState((s) => ({ ...s, quotations: [quotation, ...s.quotations] }));
      log({ user: "Vendor", action: "Submitted quotation", target: `RFQ ${q.rfqId}`, status: "submitted" });
      return quotation;
    },
    selectQuotation: (quotationId) => {
      const quotation = state.quotations.find((q) => q.id === quotationId)!;
      const approval: Approval = { id: uid(), createdAt: nowIso(), quotationId, rfqId: quotation.rfqId, status: "pending", remarks: "" };
      setState((s) => ({
        ...s,
        approvals: [approval, ...s.approvals],
        quotations: s.quotations.map((q) => (q.id === quotationId ? { ...q, status: "selected" } : q.rfqId === quotation.rfqId ? { ...q, status: "rejected" } : q)),
      }));
      log({ user: "Officer", action: "Sent quotation for approval", target: `Quote ${quotationId}`, status: "pending" });
      return approval;
    },
    decideApproval: (id, status, remarks, approverId) => {
      setState((s) => ({
        ...s,
        approvals: s.approvals.map((a) => (a.id === id ? { ...a, status, remarks, approverId, decidedAt: nowIso() } : a)),
      }));
      log({ user: "Approver", action: status === "approved" ? "Approved request" : "Rejected request", target: `Approval ${id}`, status });
    },
    generatePO: (approvalId) => {
      const approval = state.approvals.find((a) => a.id === approvalId);
      if (!approval || approval.status !== "approved") return null;
      const quotation = state.quotations.find((q) => q.id === approval.quotationId)!;
      const po: PurchaseOrder = {
        id: uid(),
        poNumber: `PO-${new Date().getFullYear()}-${String(state.purchaseOrders.length + 1).padStart(4, "0")}`,
        quotationId: quotation.id,
        rfqId: quotation.rfqId,
        vendorId: quotation.vendorId,
        amount: quotation.totalPrice,
        status: "issued",
        createdAt: nowIso(),
      };
      setState((s) => ({ ...s, purchaseOrders: [po, ...s.purchaseOrders], rfqs: s.rfqs.map((r) => (r.id === po.rfqId ? { ...r, status: "awarded" } : r)) }));
      log({ user: "Officer", action: "Generated purchase order", target: po.poNumber, status: "issued" });
      return po;
    },
    generateInvoice: (poId) => {
      const po = state.purchaseOrders.find((p) => p.id === poId);
      if (!po) return null;
      const subtotal = po.amount;
      const tax = Math.round(subtotal * 0.18 * 100) / 100;
      const invoice: Invoice = {
        id: uid(),
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(state.invoices.length + 1).padStart(4, "0")}`,
        poId: po.id,
        vendorId: po.vendorId,
        subtotal,
        tax,
        total: subtotal + tax,
        status: "draft",
        createdAt: nowIso(),
      };
      setState((s) => ({ ...s, invoices: [invoice, ...s.invoices] }));
      log({ user: "Officer", action: "Generated invoice", target: invoice.invoiceNumber, status: "draft" });
      return invoice;
    },
    updateInvoiceStatus: (id, status) => {
      setState((s) => ({ ...s, invoices: s.invoices.map((i) => (i.id === id ? { ...i, status } : i)) }));
      log({ user: "Officer", action: `Invoice marked ${status}`, target: id, status });
    },
    log,
    reset: () => {
      const s = seed();
      setState(s);
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}