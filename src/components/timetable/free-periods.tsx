import { Card } from "@/components/ui/card";
import type { FreePeriod } from "@/types/timetable";
import { getFormattedTime } from "@/services/timetable/timetable-data";

type FreePeriodsProps = {
  periods: FreePeriod[];
};

export function FreePeriods({
  periods,
}: FreePeriodsProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-brand-600">
          Smart gaps
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Today&apos;s free periods
        </h2>
      </div>

      {periods.length === 0 ? (
        <Card>
          <p className="font-medium">
            No significant free period detected
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            CampusMate found no gap of at least
            30 minutes between today&apos;s classes.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {periods.map((period) => (
            <Card
              key={`${period.startTime}-${period.endTime}`}
            >
              <p className="text-sm font-semibold">
                {getFormattedTime(
                  period.startTime,
                )}{" "}
                –{" "}
                {getFormattedTime(
                  period.endTime,
                )}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {period.durationMinutes} minutes free
              </p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}