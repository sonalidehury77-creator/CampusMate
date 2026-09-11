import { Card } from "@/components/ui/card";
import type { TimetableData } from "@/types/timetable";
import { getFormattedTime } from "@/services/timetable/timetable-data";

type TimetableSummaryProps = {
  data: TimetableData;
};

export function TimetableSummary({
  data,
}: TimetableSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Today
        </p>

        <p className="text-2xl font-bold">
          {data.todayEntries.length}
        </p>

        <p className="text-xs text-muted-foreground">
          Classes on {data.todayLabel}
        </p>
      </Card>

      <Card className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Next class
        </p>

        {data.nextClass ? (
          <>
            <p className="text-lg font-bold">
              {data.nextClass.subjectName}
            </p>

            <p className="text-xs text-muted-foreground">
              {getFormattedTime(
                data.nextClass.startTime,
              )}{" "}
              ·{" "}
              {data.nextClass.room ??
                "Room not assigned"}
            </p>
          </>
        ) : data.currentClass ? (
          <>
            <p className="text-lg font-bold">
              Currently in class
            </p>

            <p className="text-xs text-muted-foreground">
              {data.currentClass.subjectName}
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold">
              No more classes
            </p>

            <p className="text-xs text-muted-foreground">
              Your academic schedule is clear.
            </p>
          </>
        )}
      </Card>

      <Card className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Free periods
        </p>

        <p className="text-2xl font-bold">
          {data.freePeriods.length}
        </p>

        <p className="text-xs text-muted-foreground">
          Gaps of at least 30 minutes today
        </p>
      </Card>
    </div>
  );
}