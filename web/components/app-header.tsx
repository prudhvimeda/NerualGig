"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDemoAuth } from "./demo-auth";

const clientLinks = [
  { label: "Dashboard", href: "/client/dashboard" },
  { label: "Workshop", href: "/client/workshop" },
  { label: "Applications", href: "/client/applications" },
  { label: "Post a Project", href: "/client/projects/new" },
  { label: "Talent", href: "/client/talent" },
  { label: "Payments", href: "/client/payments" },
];

const freelancerLinks = [
  { label: "Dashboard", href: "/freelancer/dashboard" },
  { label: "Workshop", href: "/freelancer/workshop" },
  { label: "Applications", href: "/freelancer/applications" },
  { label: "Find Projects", href: "/freelancer/projects" },
  { label: "Payments", href: "/freelancer/payments" },
  { label: "Learning", href: "/freelancer/learning" },
];

const generalLinks = [
  { label: "Overview", href: "/" },
  { label: "Clients", href: "/client/dashboard" },
  { label: "Freelancers", href: "/freelancer/dashboard" },
  { label: "Pricing", href: "/pricing" },
];

export function AppHeader() {
  const { role, setRole } = useDemoAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const inferredSection = pathname.startsWith("/client")
    ? "client"
    : pathname.startsWith("/freelancer")
    ? "freelancer"
    : null;

  const activeRole = role ?? (inferredSection === "client" ? "client" : inferredSection === "freelancer" ? "freelancer" : null);

  const links = activeRole === "client" ? clientLinks : activeRole === "freelancer" ? freelancerLinks : generalLinks;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (event.target instanceof Node && menuRef.current.contains(event.target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [menuOpen]);

  const handleSignOut = () => {
    setRole(null);
    setMenuOpen(false);
    if (!pathname.startsWith("/")) {
      router.push("/");
      return;
    }
    if (pathname.startsWith("/client") || pathname.startsWith("/freelancer")) {
      router.push("/");
    }
  };

  const profileLink = activeRole === "client" ? "/client/profile" : "/freelancer/profile";
  const workshopLink = activeRole === "client" ? "/client/workshop" : "/freelancer/workshop";

  return (
    <header className="pointer-events-none fixed left-1/2 top-6 z-50 w-full -translate-x-1/2 px-4">
      <div className="pointer-events-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-full px-4 py-2 sm:px-6 sm:py-3">
        <Link href="/" className="flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-3 py-2 text-lg font-display font-semibold text-slate-900 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <span aria-hidden="true" className="text-xl leading-none">
            🧠
          </span>
          <span className="leading-tight">NeuralGig</span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <nav className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-gradient-to-r from-white via-white to-brand-50/60 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1 transition ${
                    isActive ? "bg-white/70 text-slate-900 shadow-sm" : "hover:bg-white/60 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-700">
          {activeRole && (
            <div className="relative hidden md:flex" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-white/60 bg-white/85 px-2 py-1 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-center text-sm font-semibold leading-8 text-white">
                  {activeRole === "client" ? "C" : "F"}
                </span>
                <div className="mr-1 flex flex-col leading-tight text-left">
                  <span className="text-xs font-semibold text-slate-700">{activeRole === "client" ? "Demo Client" : "Demo Freelancer"}</span>
                  <span className="text-[11px] text-brand-500">Menu</span>
                </div>
                <span aria-hidden="true" className="text-slate-400">
                  ▾
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-white/80 bg-white/95 px-2 py-2 text-sm text-slate-700 shadow-[0_24px_55px_-30px_rgba(15,23,42,0.55)] backdrop-blur-2xl">
                  <Link
                    href={profileLink}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-brand-50 hover:text-brand-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    View profile
                  </Link>
                  <Link
                    href={workshopLink}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-brand-50 hover:text-brand-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Open workshop
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
