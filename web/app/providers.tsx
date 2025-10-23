"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../components/auth-provider";
import { DemoAuthProvider } from "../components/demo-auth";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <DemoAuthProvider>{children}</DemoAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
