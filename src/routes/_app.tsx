import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  component: AppGuard,
});

function AppGuard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Outlet />;
}