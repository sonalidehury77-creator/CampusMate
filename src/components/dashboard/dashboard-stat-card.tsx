import type { ReactNode } from "react";

type DashboardStatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
};

export function DashboardStatCard({
  title,
  value,
  description,
  icon,
}: DashboardStatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}