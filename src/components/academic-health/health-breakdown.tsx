import type { HealthMetric } from "@/types/academic-health";

type HealthBreakdownProps = {
  attendance: HealthMetric;
  assignments: HealthMetric;
  syllabus: HealthMetric;
  studyConsistency: HealthMetric;
  examReadiness: HealthMetric;
};

function getScoreClass(score: number): string {
  if (score >= 80) {
    return "text-emerald-600";
  }

  if (score >= 60) {
    return "text-amber-600";
  }

  return "text-red-600";
}

export function HealthBreakdown({
  attendance,
  assignments,
  syllabus,
  studyConsistency,
  examReadiness,
}: HealthBreakdownProps) {
  const metrics = [
    attendance,
    assignments,
    syllabus,
    studyConsistency,
    examReadiness,
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Health Breakdown
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          See how each academic area contributes to your
          overall health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </p>

                <p
                  className={`mt-2 text-3xl font-bold ${getScoreClass(
                    metric.score,
                  )}`}
                >
                  {Math.round(metric.score)}
                </p>
              </div>

              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold capitalize text-muted-foreground">
                {metric.level.replace(
                  "_",
                  " ",
                )}
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {metric.description}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      metric.score,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}