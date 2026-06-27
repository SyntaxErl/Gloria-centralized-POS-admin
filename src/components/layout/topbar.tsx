"use client";

export function Topbar({
  fullName,
  role,
  onMenuClick,
  logoutAction,
}: {
  fullName: string | null;
  role: string;
  onMenuClick: () => void;
  logoutAction: () => void;
}) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <div>
          <p className="text-sm font-medium text-slate-900">{fullName}</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {role.replace("_", " ")}
          </p>
        </div>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}