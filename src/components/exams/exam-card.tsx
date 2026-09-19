import Link from "next/link";

import type { Exam } from "@/types/exams";

type ExamCardProps = {
  exam: Exam;
  daysRemaining: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
    },
  ).format(
    new Date(
      `${value}T00:00:00+05:30`,
    ),
  );
}

function formatTime(value: string | null) {
  if (!value) {
    return "";
  }

  const [hours, minutes] =
    value.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0,
  );

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

export function ExamCard({
  exam,
  daysRemaining,
}: ExamCardProps) {
  return (
    <Link
      href={`/exams/${exam.id}`}
      className="block rounded-2xl border border-border bg-card p-5 transition hover:border-brand-300 hover:bg-brand-50/30"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">
            {exam.subjectCode}
          </p>

          <h2 className="mt-1 text-lg font-bold text-foreground">
            {exam.subjectName}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {exam.examType}
          </p>
        </div>

        <div className="rounded-xl bg-brand-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-brand-700">
            {daysRemaining < 0
              ? "Done"
              : daysRemaining === 0
                ? "Today"
                : daysRemaining}
          </p>

          {daysRemaining > 0 && (
            <p className="text-xs text-brand-700">
              days left
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Date
          </p>
          <p className="mt-1 font-medium">
            {formatDate(exam.examDate)}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Time
          </p>
          <p className="mt-1 font-medium">
            {formatTime(exam.startTime)}
            {exam.endTime
              ? ` – ${formatTime(exam.endTime)}`
              : ""}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Room
          </p>
          <p className="mt-1 font-medium">
            {exam.room ?? "Not specified"}
          </p>
        </div>
      </div>
    </Link>
  );
}