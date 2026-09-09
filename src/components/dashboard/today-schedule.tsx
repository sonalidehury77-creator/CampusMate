type ScheduleItem = {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  room?: string | null;
};

type TodayScheduleProps = {
  items: ScheduleItem[];
};

export function TodaySchedule({
  items,
}: TodayScheduleProps) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="text-lg font-semibold text-foreground">
          Today&apos;s schedule
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Your classes for today.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="p-5">
          <p className="text-sm text-muted-foreground">
            No classes scheduled for today.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"
            >
              <div className="w-28 shrink-0">
                <p className="text-sm font-semibold text-foreground">
                  {item.startTime}
                </p>

                <p className="text-xs text-muted-foreground">
                  {item.endTime}
                </p>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {item.subject}
                </p>

                {item.room && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.room}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}