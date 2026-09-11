import { Card } from "@/components/ui/card";
import { TimetableEntryCard } from "@/components/timetable/timetable-entry-card";
import type { TimetableData } from "@/types/timetable";

type TodayScheduleProps = {
  data: TimetableData;
};

export function TodaySchedule({
  data,
}: TodayScheduleProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-brand-600">
          Today&apos;s schedule
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          {data.todayLabel}
        </h2>
      </div>

      {data.todayEntries.length === 0 ? (
        <Card>
          <p className="font-medium">
            No classes today
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Enjoy your free academic day or use
            the time for focused study.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.todayEntries.map((entry) => (
            <TimetableEntryCard
              key={entry.id}
              entry={entry}
              isCurrent={
                data.currentClass?.id === entry.id
              }
              isNext={
                data.nextClass?.id === entry.id
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}