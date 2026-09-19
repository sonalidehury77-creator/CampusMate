import type { ExamPreparationOverview } from "@/types/exams";

type ExamPreparationOverviewProps = {
  overview: ExamPreparationOverview;
};

export function ExamPreparationOverview({
  overview,
}: ExamPreparationOverviewProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Upcoming exams
        </p>

        <p className="mt-2 text-3xl font-bold">
          {overview.totalUpcomingExams}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Within 7 days
        </p>

        <p className="mt-2 text-3xl font-bold">
          {overview.examsWithinSevenDays}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Average readiness
        </p>

        <p className="mt-2 text-3xl font-bold">
          {overview.averageReadiness}%
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Need revision
        </p>

        <p className="mt-2 text-3xl font-bold">
          {overview.subjectsNeedingRevision}
        </p>
      </div>
    </section>
  );
}