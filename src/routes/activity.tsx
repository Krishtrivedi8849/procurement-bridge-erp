import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { AppLayout, StatusBadge } from "@/components/AppLayout";
import { useStore, formatDateTime } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [{ title: "Activity Logs — VendorBridge" }] }),
  component: () => <RequireAuth roles={["admin", "officer", "approver"]}><Page /></RequireAuth>,
});

function Page() {
  const { logs } = useStore();
  return (
    <AppLayout title="Activity Logs" subtitle="Audit trail of procurement actions across the workspace">
      <Card><CardContent className="p-0">
        {logs.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">No activity yet. Create an RFQ or vendor to see the audit timeline.</div>}
        <ol className="relative">
          {logs.map((l, i) => (
            <li key={l.id} className={`flex gap-4 px-6 py-4 ${i !== logs.length - 1 ? "border-b border-border" : ""}`}>
              <div className="relative flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary"><Activity className="h-4 w-4" /></div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{l.user}</span>
                  <span className="text-muted-foreground">{l.action}</span>
                  <span className="font-medium text-foreground">{l.target}</span>
                  <StatusBadge status={l.status} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{formatDateTime(l.timestamp)}</div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent></Card>
    </AppLayout>
  );
}