import { Card } from "@/components/ui/card";
import type { AttendanceData } from "@/types/attendance";

type AttendanceSummaryProps = {
  data: AttendanceData;
};

export function AttendanceSummary({
  data,
}: AttendanceSummaryProps) {
  const {
    summary,
  } = data;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Overall attendance
        </p>

        <p className="text-3xl font-bold">
          {summary.percentage}%
        </p>

        <p className="text-xs text-muted-foreground">
          Required:{" "}
          {summary.requiredPercentage}%
        </p>
      </Card>

      <Card className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Present
        </p>

        <p className="text-3xl font-bold">
          {summary.presentClasses}
        </p>

        <p className="text-xs text-muted-foreground">
          Classes attended
        </p>
      </Card>

      <Card className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Absent
        </p>

        <p className="text-3xl font-bold">
          {summary.absentClasses}
        </p>

        <p className="text-xs text-muted-foreground">
          Classes missed
        </p>
      </Card>

      <Card className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Total classes
        </p>

        <p className="text-3xl font-bold">
          {summary.totalClasses}
        </p>

        <p
          className={`text-xs font-medium ${
            summary.isAtRisk
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {summary.totalClasses === 0
            ? "No attendance data"
            : summary.isAtRisk
              ? "Attendance needs attention"
              : "Attendance is on track"}
        </p>
      </Card>
    </div>
  );
}