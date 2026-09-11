import { AcademicSummaryCard } from "@/components/academics/academic-summary-card";
import { ProgressBar } from "@/components/academics/progress-bar";
import type { AcademicData } from "@/types/academics";

type AcademicOverviewProps = {
  data: AcademicData;
};

export function AcademicOverview({
  data,
}: AcademicOverviewProps) {
  const {
    profile,
    subjects,
    overallProgress,
    totalCredits,
    completedSubjects,
    needsAttentionSubjects,
  } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AcademicSummaryCard
          label="Current semester"
          value={
            profile.semester
              ? `Semester ${profile.semester.semesterNumber}`
              : "—"
          }
          description={
            profile.semester?.academicYear ??
            "Academic year unavailable"
          }
        />

        <AcademicSummaryCard
          label="Subjects"
          value={String(subjects.length)}
          description="Subjects in your current semester"
        />

        <AcademicSummaryCard
          label="Credits"
          value={
            totalCredits
              ? String(totalCredits)
              : "—"
          }
          description="Total configured credits"
        />

        <AcademicSummaryCard
          label="Completed"
          value={`${completedSubjects}/${subjects.length}`}
          description="Subjects at 100% progress"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-brand-600">
                Academic progress
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Current semester health
              </h2>
            </div>

            <span className="text-2xl font-bold">
              {Math.round(overallProgress)}%
            </span>
          </div>

          <div className="mt-5">
            <ProgressBar value={overallProgress} />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Calculated from your saved subject progress.
            No artificial academic score is used.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-brand-600">
            Smart attention
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Subjects needing attention
          </h2>

          <p className="mt-4 text-3xl font-bold">
            {needsAttentionSubjects}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Subjects below 50% saved progress.
          </p>
        </div>
      </div>
    </div>
  );
}