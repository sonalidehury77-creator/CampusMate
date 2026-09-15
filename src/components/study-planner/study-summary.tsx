import { Card } from "@/components/ui/card";

type StudySummaryProps = {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  todayTasks: number;
  todayCompleted: number;
  weeklyFocusMinutes: number;
};

export function StudySummary({
  totalTasks,
  completedTasks,
  pendingTasks,
  overdueTasks,
  todayTasks,
  todayCompleted,
  weeklyFocusMinutes,
}: StudySummaryProps) {
  const completionPercentage =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) * 100,
        )
      : 0;

  const items = [
    {
      label: "Today's tasks",
      value: `${todayCompleted}/${todayTasks}`,
    },
    {
      label: "Pending",
      value: pendingTasks,
    },
    {
      label: "Overdue",
      value: overdueTasks,
    },
    {
      label: "Overall progress",
      value: `${completionPercentage}%`,
    },
    {
      label: "Weekly focus",
      value: `${weeklyFocusMinutes} min`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-sm text-muted-foreground">
            {item.label}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}