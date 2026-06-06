import { Navigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/store";

export function RequireAuth({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Restricted area</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your role ({user.role}) doesn't have access to this module.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}