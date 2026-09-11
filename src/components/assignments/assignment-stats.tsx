import { Card } from "@/components/ui/card";
import type { AssignmentStats } from "@/types/assignments";

type AssignmentStatsProps = {
  stats: AssignmentStats;
};

export function AssignmentStats({
  stats,
}: AssignmentStatsProps) {
  const items = [
    {
      label: "Total",
      value: stats.total,
      description: "All assignments",
    },
    {
      label: "Pending",
      value: stats.pending,
      description: "Not started",
    },
    {
      label: "In progress",
      value: stats.inProgress,
      description: "Currently working",
    },
    {
      label: "Completed",
      value: stats.completed,
      description: "Finished",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      description: "Past deadline",
    },
    {
      label: "Due soon",
      value: stats.dueSoon,
      description: "Within 48 hours",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <Card
          key={item.label}
          className="space-y-2"
        >
          <p className="text-sm text-muted-foreground">
            {item.label}
          </p>

          <p className="text-2xl font-bold">
            {item.value}
          </p>

          <p className="text-xs text-muted-foreground">
            {item.description}
          </p>
        </Card>
      ))}
    </div>
  );
}