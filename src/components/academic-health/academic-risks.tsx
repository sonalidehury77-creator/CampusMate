import type { AcademicRisk } from "@/types/academic-health";

type AcademicRisksProps = {
  risks: AcademicRisk[];
};

function getSeverityClass(
  severity: AcademicRisk["severity"],
): string {
  if (severity === "high") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  if (severity === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-blue-200 bg-blue-50 text-blue-800";
}

export function AcademicRisks({
  risks,
}: AcademicRisksProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Academic Risks
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Issues that may affect your academic progress
          if they remain unresolved.
        </p>
      </div>

      {risks.length === 0 ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            No major risks detected
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            Your currently tracked academic data does
            not show any major risk.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {risks.map((risk) => (
            <article
              key={risk.id}
              className={`rounded-xl border p-4 ${getSeverityClass(
                risk.severity,
              )}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
                    {risk.severity} risk
                  </p>

                  <h3 className="mt-1 text-sm font-bold">
                    {risk.title}
                  </h3>
                </div>

                {risk.subjectName && (
                  <span className="shrink-0 rounded-full bg-white/60 px-2 py-1 text-xs font-medium">
                    {risk.subjectName}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm leading-5 opacity-90">
                {risk.description}
              </p>

              <div className="mt-3 rounded-lg bg-white/50 p-3">
                <p className="text-xs font-semibold">
                  Recommended action
                </p>

                <p className="mt-1 text-sm">
                  {risk.action}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}