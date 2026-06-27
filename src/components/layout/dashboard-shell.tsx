"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

type NavItem = { label: string; href: string };

/**
 * Holds the one piece of state the responsive sidebar needs (open/closed
 * on mobile). This has to be a Client Component — the parent layout.tsx
 * stays a Server Component (it needs to fetch the user's profile), so
 * this is the boundary between the two.
 */
export function DashboardShell({
  navItems,
  fullName,
  role,
  logoutAction,
  children,
}: {
  navItems: NavItem[];
  fullName: string | null;
  role: string;
  logoutAction: () => void;
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <Sidebar
        navItems={navItems}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* min-w-0 is the actual fix: without it, a wide child (like the
          branches table) forces this whole column wider than the
          viewport instead of scrolling inside its own container. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          fullName={fullName}
          role={role}
          onMenuClick={() => setMobileNavOpen(true)}
          logoutAction={logoutAction}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}