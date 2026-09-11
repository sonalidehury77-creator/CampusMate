import { TimetableEntryCard } from "@/components/timetable/timetable-entry-card";
import { Card } from "@/components/ui/card";
import type {
  TimetableData,
  TimetableEntry,
} from "@/types/timetable";

type WeeklyTimetableProps = {
  data: TimetableData;
};

function isNextClass(
  entry: TimetableEntry,
  data: TimetableData,
) {
  return data.nextClass?.id === entry.id;
}

function isCurrentClass(
  entry: TimetableEntry,
  data: TimetableData,
) {
  return data.currentClass?.id === entry.id;
}

export function WeeklyTimetable({
  data,
}: WeeklyTimetableProps) {
  return (
    <div className="space-y-4">
      {data.weeklySchedule.map((day) => {
        const isToday =
          day.dayOfWeek ===
          data.todayDayOfWeek;

        return (
          <section
            key={day.dayOfWeek}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {day.label}
                </h2>

                {isToday && (
                  <p className="text-xs font-medium text-brand-600">
                    Today
                  </p>
                )}
              </div>

              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {day.entries.length}{" "}
                {day.entries.length === 1
                  ? "class"
                  : "classes"}
              </span>
            </div>

            {day.entries.length === 0 ? (
              <Card>
                <p className="text-sm text-muted-foreground">
                  No classes scheduled.
                </p>
              </Card>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {day.entries.map(
                  (entry) => (
                    <TimetableEntryCard
                      key={entry.id}
                      entry={entry}
                      isCurrent={
                        isCurrentClass(
                          entry,
                          data,
                        )
                      }
                      isNext={
                        isNextClass(
                          entry,
                          data,
                        )
                      }
                    />
                  ),
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}