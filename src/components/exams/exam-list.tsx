import type { Exam } from "@/types/exams";

import { ExamCard } from "./exam-card";

type ExamListProps = {
  exams: Exam[];
};

function calculateDaysRemaining(
  examDate: string,
) {
  const today = new Date(
    `${new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date())}T00:00:00+05:30`,
  );

  const exam = new Date(
    `${examDate}T00:00:00+05:30`,
  );

  return Math.round(
    (exam.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

export function ExamList({
  exams,
}: ExamListProps) {
  if (exams.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <h2 className="font-semibold">
          No exams found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Exam schedules will appear here when they are added.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exams.map((exam) => (
        <ExamCard
          key={exam.id}
          exam={exam}
          daysRemaining={calculateDaysRemaining(
            exam.examDate,
          )}
        />
      ))}
    </div>
  );
}