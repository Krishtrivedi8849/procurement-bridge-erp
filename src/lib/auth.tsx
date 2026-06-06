import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role, User } from "./store";

const AUTH_KEY = "vendorbridge_auth_v1";

const DEMO_USERS: User[] = [
  { id: "u1", name: "Alex Morgan", email: "admin@vendorbridge.com", role: "admin" },
  { id: "u2", name: "Priya Shah", email: "officer@vendorbridge.com", role: "officer" },
  { id: "u3", name: "David Chen", email: "approver@vendorbridge.com", role: "approver" },
  { id: "u4", name: "Acme Vendor", email: "vendor@acme.com", role: "vendor", vendorId: "v1" },
];

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginAs: (role: Role) => void;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    else localStorage.removeItem(AUTH_KEY);
  }, [user]);

  const value: AuthContextValue = {
    user,
    login: (email, password) => {
      const u = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!u) return { ok: false, error: "No account found for that email" };
      if (password.length < 4) return { ok: false, error: "Password must be at least 4 characters" };
      setUser(u);
      return { ok: true };
    },
    loginAs: (role) => {
      const u = DEMO_USERS.find((u) => u.role === role);
      if (u) setUser(u);
    },
    logout: () => setUser(null),
    hasRole: (...roles) => (user ? roles.includes(user.role) : false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}

export { DEMO_USERS };