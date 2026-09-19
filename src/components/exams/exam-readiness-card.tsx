import type { ExamReadiness } from "@/types/exams";

import { ExamStatusBadge } from "./exam-status-badge";

type ExamReadinessCardProps = {
  readiness: ExamReadiness;
};

export function ExamReadinessCard({
  readiness,
}: ExamReadinessCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">
            Preparation Intelligence
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {readiness.subjectName}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {readiness.subjectCode}
          </p>
        </div>

        <ExamStatusBadge
          status={readiness.status}
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Readiness
          </span>

          <span className="text-sm font-bold">
            {readiness.readinessPercentage}%
          </span>
        </div>

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{
              width: `${readiness.readinessPercentage}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">
            Syllabus
          </p>

          <p className="mt-1 font-semibold">
            {readiness.syllabusProgress}%
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Assignments
          </p>

          <p className="mt-1 font-semibold">
            {readiness.assignmentCompletion}%
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Attendance
          </p>

          <p className="mt-1 font-semibold">
            {readiness.attendancePercentage ===
            null
              ? "—"
              : `${readiness.attendancePercentage}%`}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Study consistency
          </p>

          <p className="mt-1 font-semibold">
            {readiness.studyConsistency}%
          </p>
        </div>
      </div>

      {readiness.concerns.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-semibold">
            Areas needing attention
          </p>

          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {readiness.concerns.map(
              (concern) => (
                <li key={concern}>
                  • {concern}
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {readiness.recommendations.length >
        0 && (
        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/40 p-4">
          <p className="text-sm font-semibold text-brand-700">
            Recommended next steps
          </p>

          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {readiness.recommendations.map(
              (recommendation) => (
                <li
                  key={recommendation}
                >
                  • {recommendation}
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </section>
  );
}