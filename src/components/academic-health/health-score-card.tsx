import type { HealthLevel } from "@/types/academic-health";

type HealthScoreCardProps = {
  score: number;
  level: HealthLevel;
  summary: string;
};

const levelLabels: Record<
  HealthLevel,
  string
> = {
  excellent: "Excellent",
  good: "Good",
  moderate: "Moderate",
  needs_attention: "Needs Attention",
  critical: "Critical",
};

export function HealthScoreCard({
  score,
  level,
  summary,
}: HealthScoreCardProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="grid gap-8 p-6 md:grid-cols-[220px_1fr] md:p-8">
        <div className="flex items-center justify-center">
          <div className="flex h-44 w-44 flex-col items-center justify-center rounded-full border-8 border-brand-100">
            <span className="text-5xl font-bold text-brand-700">
              {score}
            </span>

            <span className="text-sm text-muted-foreground">
              / 100
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold text-brand-600">
            Academic Health
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {levelLabels[level]}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            {summary}
          </p>

          <p className="mt-4 text-xs text-muted-foreground">
            This score is calculated from your current
            CampusMate academic data.
          </p>
        </div>
      </div>
    </section>
  );
}