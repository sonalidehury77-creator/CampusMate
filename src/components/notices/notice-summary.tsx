import { Card } from "@/components/ui/card";

type NoticeSummaryProps = {
  total: number;
  urgent: number;
  important: number;
  upcomingDeadlines: number;
  overdue: number;
};

export function NoticeSummary({
  total,
  urgent,
  important,
  upcomingDeadlines,
  overdue,
}: NoticeSummaryProps) {
  const items = [
    {
      label: "Total notices",
      value: total,
    },
    {
      label: "Urgent",
      value: urgent,
    },
    {
      label: "Important",
      value: important,
    },
    {
      label: "Deadline soon",
      value: upcomingDeadlines,
    },
    {
      label: "Overdue",
      value: overdue,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-sm text-muted-foreground">
            {item.label}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}