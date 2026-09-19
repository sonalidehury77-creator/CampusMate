import type { ExamStatus } from "@/types/exams";

type ExamStatusBadgeProps = {
  status: ExamStatus;
};

const labels: Record<
  ExamStatus,
  string
> = {
  completed: "Completed",
  today: "Today",
  tomorrow: "Tomorrow",
  upcoming: "Upcoming",
  overdue: "Overdue",
};

export function ExamStatusBadge({
  status,
}: ExamStatusBadgeProps) {
  return (
    <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
      {labels[status]}
    </span>
  );
}