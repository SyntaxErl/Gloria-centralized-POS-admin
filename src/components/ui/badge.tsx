type BadgeVariant = "success" | "neutral" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-secondary/10 text-secondary",
  neutral: "bg-slate-100 text-slate-600",
  danger: "bg-danger/10 text-danger",
};

export function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
