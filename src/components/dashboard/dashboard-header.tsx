import { Logo } from "@/components/logo";

type DashboardHeaderProps = {
  fullName: string;
};

export function DashboardHeader({
  fullName,
}: DashboardHeaderProps) {
  const firstName = fullName.trim().split(" ")[0] || "Student";

  const hour = new Date().getHours();

  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <Logo />

      <div>
        <p className="text-sm font-medium text-brand-600">
          {greeting}
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {firstName} 👋
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Here&apos;s your academic overview and everything that
          needs your attention.
        </p>
      </div>
    </div>
  );
}