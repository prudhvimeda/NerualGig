"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type DemoRole = "client" | "freelancer" | null;

type DemoAuthValue = {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  isClient: boolean;
  isFreelancer: boolean;
  signOut: () => void;
};

const KEY = "neuralgig:demo-role";

const DemoAuthContext = createContext<DemoAuthValue | undefined>(undefined);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<DemoRole>(null);

  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem(KEY) as DemoRole)) || null;
    if (saved === "client" || saved === "freelancer") {
      setRoleState(saved);
    }
  }, []);

  const setRole = (next: DemoRole) => {
    setRoleState(next);
    if (typeof window !== "undefined") {
      if (next) localStorage.setItem(KEY, next);
      else localStorage.removeItem(KEY);
    }
  };

  const value = useMemo<DemoAuthValue>(() => ({
    role,
    setRole,
    isClient: role === "client",
    isFreelancer: role === "freelancer",
    signOut: () => setRole(null),
  }), [role]);

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

export function useDemoAuth(): DemoAuthValue {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) throw new Error("useDemoAuth must be used within DemoAuthProvider");
  return ctx;
}

