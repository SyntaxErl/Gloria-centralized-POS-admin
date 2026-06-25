import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";

type NavItem = { label: string; href: string };
type Role = "admin" | "branch_manager";

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Branches", href: "/branches" },
  { label: "Categories", href: "/categories" },
  { label: "Products", href: "/products" },
  { label: "Inventory Categories", href: "/inventory/categories" },
  { label: "Inventory Items", href: "/inventory/items" },
  { label: "Inventory Monitoring", href: "/inventory/monitoring" },
  { label: "Sales Reports", href: "/reports/sales" },
  { label: "Inventory Movement", href: "/reports/inventory-movement" },
  { label: "Users", href: "/users" },
  { label: "Audit Logs", href: "/audit-logs" },
];

const BRANCH_MANAGER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/branch/dashboard" },
  { label: "Cashiers", href: "/branch/cashiers" },
  { label: "Inventory", href: "/branch/inventory" },
];

async function logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerList = await headers();
  const headerRole = headerList.get("x-user-role") as Role | null;
  const headerFullName = headerList.get("x-user-full-name");

  let role: Role;
  let fullName: string | null;

  if (headerRole) {
    // Common case: middleware already resolved this, just read it —
    // no DB round-trip needed.
    role = headerRole;
    fullName = headerFullName;
  } else {
    // Fallback only — shouldn't normally happen, since middleware's
    // matcher covers this route group. Kept as a safety net rather than
    // assuming headers are always present.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (!profile) {
      redirect("/login?error=profile_not_found");
    }

    if (profile.role === "cashier") {
      redirect("/login?error=cashier_web_access_denied");
    }

    role = profile.role as Role;
    fullName = profile.full_name;
  }

  const navItems = role === "admin" ? ADMIN_NAV : BRANCH_MANAGER_NAV;

  return (
    <DashboardShell
      navItems={navItems}
      fullName={fullName}
      role={role}
      logoutAction={logout}
    >
      {children}
    </DashboardShell>
  );
}