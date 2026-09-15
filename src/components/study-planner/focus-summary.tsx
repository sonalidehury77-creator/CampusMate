import { Card } from "@/components/ui/card";

type FocusSummaryProps = {
  todayMinutes: number;
  weeklyMinutes: number;
  sessions: number;
};

export function FocusSummary({
  todayMinutes,
  weeklyMinutes,
  sessions,
}: FocusSummaryProps) {
  const items = [
    {
      label: "Today",
      value: `${todayMinutes} min`,
    },
    {
      label: "This week",
      value: `${weeklyMinutes} min`,
    },
    {
      label: "Sessions",
      value: sessions,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
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