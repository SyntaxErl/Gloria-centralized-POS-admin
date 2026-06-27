import type { ReactNode, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function Table({ children, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full max-w-full overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm" {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50 text-xs uppercase text-slate-500">{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr className="hover:bg-slate-50">{children}</tr>;
}

// className now passes through — needed so columns can be hidden at
// specific breakpoints (e.g. className="hidden sm:table-cell") without
// forking the component.
export function TableHeaderCell({
  children,
  className = "",
}: ThHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;
}

export function TableCell({
  children,
  className = "",
}: TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return <td className={`px-4 py-3 text-slate-700 ${className}`}>{children}</td>;
}