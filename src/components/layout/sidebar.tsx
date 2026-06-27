"use client";

import Link from "next/link";

type NavItem = { label: string; href: string };

export function Sidebar({
  navItems,
  open,
  onClose,
}: {
  navItems: NavItem[];
  open: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-60 shrink-0 border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-5">
        <span className="text-lg font-semibold text-primary">POS Admin</span>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}