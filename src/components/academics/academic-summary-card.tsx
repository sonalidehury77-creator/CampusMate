import { Card } from "@/components/ui/card";

type AcademicSummaryCardProps = {
  label: string;
  value: string;
  description: string;
};

export function AcademicSummaryCard({
  label,
  value,
  description,
}: AcademicSummaryCardProps) {
  return (
    <Card className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>

      <p className="text-xs text-muted-foreground">
        {description}
      </p>
    </Card>
  );
}