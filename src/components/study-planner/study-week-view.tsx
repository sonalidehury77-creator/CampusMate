"use client";

import type { StudyTask } from "@/types/study-planner";

type StudyWeekViewProps = {
  tasks: StudyTask[];
};

function getDateKey(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Kolkata",
    },
  ).format(date);
}

export function StudyWeekView({
  tasks,
}: StudyWeekViewProps) {
  const today = new Date();

  const days = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(today);

      date.setDate(
        today.getDate() + index,
      );

      return date;
    },
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Weekly study plan
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          See how your study workload is distributed.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-7">
        {days.map((date) => {
          const key = getDateKey(date);

          const dayTasks =
            tasks.filter(
              (task) =>
                task.scheduledDate === key,
            );

          return (
            <div
              key={key}
              className="min-h-32 rounded-xl border border-border bg-muted/30 p-3"
            >
              <p className="text-xs font-semibold">
                {new Intl.DateTimeFormat(
                  "en-IN",
                  {
                    weekday: "short",
                  },
                ).format(date)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {new Intl.DateTimeFormat(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                  },
                ).format(date)}
              </p>

              <div className="mt-3 space-y-2">
                {dayTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No tasks
                  </p>
                ) : (
                  dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border border-border bg-card p-2"
                    >
                      <p className="line-clamp-2 text-xs font-medium">
                        {task.title}
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {task.durationMinutes} min
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}