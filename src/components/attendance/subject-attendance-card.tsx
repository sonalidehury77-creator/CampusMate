import { Card } from "@/components/ui/card";
import type { SubjectAttendance } from "@/types/attendance";

type SubjectAttendanceCardProps = {
  subject: SubjectAttendance;
};

export function SubjectAttendanceCard({
  subject,
}: SubjectAttendanceCardProps) {
  const percentage =
    Math.min(
      Math.max(
        subject.percentage,
        0,
      ),
      100,
    );

  return (
    <Card
      className={`space-y-4 ${
        subject.isAtRisk
          ? "border-red-300"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {subject.subjectCode}
          </p>

          <h3 className="mt-1 text-lg font-semibold">
            {subject.subjectName}
          </h3>
        </div>

        <p
          className={`text-2xl font-bold ${
            subject.isAtRisk
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {subject.percentage}%
        </p>
      </div>

      <div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${
              subject.isAtRisk
                ? "bg-red-500"
                : "bg-green-500"
            }`}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>
            {subject.presentClasses} present
          </span>

          <span>
            {subject.absentClasses} absent
          </span>

          <span>
            {subject.totalClasses} total
          </span>
        </div>
      </div>

      <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">
            Target
          </p>

          <p className="mt-1 text-sm font-semibold">
            {subject.requiredPercentage}%
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Status
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${
              subject.isAtRisk
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {subject.isAtRisk
              ? "Needs attention"
              : "On track"}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Classes you can miss
          </p>

          <p className="mt-1 text-sm font-semibold">
            {subject.classesCanMiss}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Classes needed to reach 75%
          </p>

          <p className="mt-1 text-sm font-semibold">
            {
              subject.classesRequiredToReachTarget
            }
          </p>
        </div>
      </div>
    </Card>
  );
}