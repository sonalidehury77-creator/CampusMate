import type { SubjectHealth } from "@/types/academic-health";

type SubjectHealthListProps = {
  subjects: SubjectHealth[];
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

export function SubjectHealthList({
  subjects,
}: SubjectHealthListProps) {
  if (subjects.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground">
          Subject Health
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          No enrolled subjects are available yet.
          Complete your academic onboarding to see
          subject-level health.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Subject Health
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          A subject-by-subject view of attendance,
          syllabus, assignments and study activity.
        </p>
      </div>

      <div className="grid gap-4">
        {subjects.map((subject) => (
          <article
            key={subject.subjectId}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                    {subject.subjectCode}
                  </span>

                  <span className="text-xs font-medium capitalize text-muted-foreground">
                    {subject.level.replace(
                      "_",
                      " ",
                    )}
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-foreground">
                  {subject.subjectName}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {subject.recommendation}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-medium text-muted-foreground">
                    Health Score
                  </p>

                  <p
                    className={`text-3xl font-bold ${getScoreClass(
                      subject.overallScore,
                    )}`}
                  >
                    {Math.round(
                      subject.overallScore,
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label="Attendance"
                score={subject.attendance.score}
                description={`${subject.attendancePercentage.toFixed(
                  1,
                )}%`}
              />

              <Metric
                label="Syllabus"
                score={subject.syllabus.score}
                description={`${subject.progress}% progress`}
              />

              <Metric
                label="Assignments"
                score={subject.assignments.score}
                description={`${subject.pendingAssignments} pending`}
              />

              <Metric
                label="Study"
                score={subject.study.score}
                description={subject.study.description}
              />
            </div>

            {(subject.overdueAssignments > 0 ||
              subject.attendancePercentage <
                75 ||
              subject.progress < 60) && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">
                  Attention needed
                </p>

                <p className="mt-1 text-sm leading-5 text-amber-700">
                  {subject.attendancePercentage <
                  75
                    ? "Attendance is below 75%. "
                    : ""}
                  {subject.overdueAssignments >
                  0
                    ? `${subject.overdueAssignments} overdue assignment${
                        subject.overdueAssignments ===
                        1
                          ? ""
                          : "s"
                      }. `
                    : ""}
                  {subject.progress < 60
                    ? "Syllabus progress is below 60%."
                    : ""}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

type MetricProps = {
  label: string;
  score: number;
  description: string;
};

function Metric({
  label,
  score,
  description,
}: MetricProps) {
  return (
    <div className="rounded-xl bg-muted/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          {label}
        </p>

        <span className="text-sm font-bold text-foreground">
          {Math.round(score)}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-brand-600"
          style={{
            width: `${Math.min(
              100,
              Math.max(0, score),
            )}%`,
          }}
        />
      </div>

      <p className="mt-2 truncate text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}