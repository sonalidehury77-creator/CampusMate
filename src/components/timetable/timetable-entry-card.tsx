import { Card } from "@/components/ui/card";
import type { TimetableEntry } from "@/types/timetable";
import { getFormattedTime } from "@/services/timetable/timetable-data";

type TimetableEntryCardProps = {
  entry: TimetableEntry;
  isCurrent?: boolean;
  isNext?: boolean;
};

function getScheduleLabel(
  scheduleType: TimetableEntry["scheduleType"],
) {
  switch (scheduleType) {
    case "laboratory":
      return "Laboratory";

    case "tutorial":
      return "Tutorial";

    case "seminar":
      return "Seminar";

    case "lecture":
      return "Lecture";

    default:
      return "Other";
  }
}

export function TimetableEntryCard({
  entry,
  isCurrent = false,
  isNext = false,
}: TimetableEntryCardProps) {
  return (
    <Card
      className={`relative overflow-hidden ${
        isCurrent
          ? "border-brand-500 ring-2 ring-brand-500/20"
          : isNext
            ? "border-brand-300"
            : ""
      }`}
    >
      {isCurrent && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
          NOW
        </div>
      )}

      {!isCurrent && isNext && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-muted px-3 py-1 text-xs font-semibold">
          NEXT
        </div>
      )}

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {entry.subjectCode}
          </p>

          <h3 className="mt-1 text-lg font-semibold">
            {entry.subjectName}
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">
              Time
            </p>

            <p className="mt-1 text-sm font-semibold">
              {getFormattedTime(
                entry.startTime,
              )}{" "}
              –{" "}
              {getFormattedTime(
                entry.endTime,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Duration
            </p>

            <p className="mt-1 text-sm font-semibold">
              {entry.durationMinutes} minutes
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Room
            </p>

            <p className="mt-1 text-sm font-semibold">
              {entry.room ??
                "Not assigned"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Faculty
            </p>

            <p className="mt-1 text-sm font-semibold">
              {entry.facultyName ??
                "Not assigned"}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {getScheduleLabel(
              entry.scheduleType,
            )}
          </span>
        </div>
      </div>
    </Card>
  );
}