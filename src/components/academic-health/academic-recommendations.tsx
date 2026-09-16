import type {
  AcademicRecommendation,
} from "@/types/academic-health";

type AcademicRecommendationsProps = {
  recommendations: AcademicRecommendation[];
};

function getPriorityClass(
  priority: AcademicRecommendation["priority"],
): string {
  if (priority === "high") {
    return "border-red-200 bg-red-50";
  }

  if (priority === "medium") {
    return "border-amber-200 bg-amber-50";
  }

  return "border-border bg-muted/50";
}

export function AcademicRecommendations({
  recommendations,
}: AcademicRecommendationsProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Recommended Actions
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Practical actions CampusMate recommends
          based on your current academic data.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-muted/50 p-4">
          <p className="text-sm font-semibold text-foreground">
            Keep going
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Continue monitoring your attendance,
            assignments, syllabus progress and study
            activity.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {recommendations.map(
            (recommendation) => (
              <article
                key={recommendation.id}
                className={`rounded-xl border p-4 ${getPriorityClass(
                  recommendation.priority,
                )}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {recommendation.priority} priority
                    </p>

                    <h3 className="mt-1 text-sm font-bold text-foreground">
                      {recommendation.title}
                    </h3>
                  </div>

                  {recommendation.subjectName && (
                    <span className="shrink-0 rounded-full bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
                      {recommendation.subjectName}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  {recommendation.description}
                </p>

                <div className="mt-3 rounded-lg bg-background/70 p-3">
                  <p className="text-xs font-semibold text-foreground">
                    Action
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {recommendation.action}
                  </p>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
}