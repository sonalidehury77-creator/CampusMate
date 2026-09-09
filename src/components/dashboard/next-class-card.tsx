type NextClassCardProps = {
  subject?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
};

export function NextClassCard({
  subject,
  startTime,
  endTime,
  room,
}: NextClassCardProps) {
  if (!subject) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          Next class
        </p>

        <h2 className="mt-2 text-xl font-semibold text-foreground">
          No upcoming class
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          You are currently free according to your timetable.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700">
            Next class
          </p>

          <h2 className="mt-1 text-2xl font-bold text-foreground">
            {subject}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {startTime} – {endTime}
          </p>

          {room && (
            <p className="mt-1 text-sm text-muted-foreground">
              Room: {room}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-card px-4 py-3 text-center shadow-sm">
          <p className="text-xs text-muted-foreground">
            Today
          </p>

          <p className="mt-1 text-sm font-semibold text-foreground">
            Upcoming
          </p>
        </div>
      </div>
    </div>
  );
}