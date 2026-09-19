import Link from "next/link";

import type { Exam } from "@/types/exams";

type NextExamCardProps = {
  exam: Exam | null;
  daysRemaining: number | null;
};

export function NextExamCard({
  exam,
  daysRemaining,
}: NextExamCardProps) {
  if (!exam) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card p-6">
        <p className="text-sm font-semibold text-brand-600">
          Exam Intelligence
        </p>

        <h2 className="mt-1 text-xl font-bold">
          No upcoming exams
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          CampusMate will show your next exam here when it is scheduled.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-700">
            Next Exam
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {exam.subjectName}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {exam.subjectCode} · {exam.examType}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-3xl font-bold text-brand-700">
            {daysRemaining === 0
              ? "Today"
              : `${daysRemaining} days`}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            remaining
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/exams/${exam.id}`}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          View exam
        </Link>

        <Link
          href="/study-planner"
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          Open study planner
        </Link>

        <Link
          href="/ai"
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
          Ask CampusMate AI
        </Link>
      </div>
    </section>
  );
}