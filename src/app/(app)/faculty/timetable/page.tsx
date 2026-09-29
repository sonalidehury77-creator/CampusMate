import { Card } from "@/components/ui/card";

import {
  getFacultyTimetable,
} from "@/services/faculty/faculty-data";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function FacultyTimetablePage() {
  const timetable =
    await getFacultyTimetable();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Teaching
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Timetable
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Your complete teaching schedule.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {DAYS.slice(1).map(
          (day, index) => {
            const dayNumber =
              index + 1;

            const entries =
              timetable.filter(
                (entry) =>
                  entry.day_of_week ===
                  dayNumber,
              );

            return (
              <Card
                key={day}
                className="p-6"
              >
                <h2 className="font-semibold">
                  {day}
                </h2>

                <div className="mt-4 space-y-3">
                  {entries.length ===
                  0 ? (
                    <p className="text-sm text-muted-foreground">
                      No classes.
                    </p>
                  ) : (
                    entries.map(
                      (entry) => (
                        <div
                          key={
                            entry.id
                          }
                          className="rounded-xl border p-4"
                        >
                          <p className="font-medium">
                            {
                              entry.subjectName
                            }
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {
                              entry.subjectCode
                            }
                          </p>

                          <p className="mt-3 text-sm">
                            {
                              entry.start_time
                            }{" "}
                            –{" "}
                            {
                              entry.end_time
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Room{" "}
                            {entry.room ??
                              "—"}
                          </p>
                        </div>
                      ),
                    )
                  )}
                </div>
              </Card>
            );
          },
        )}
      </div>
    </div>
  );
}