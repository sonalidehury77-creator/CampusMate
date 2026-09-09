type AttendanceSubject = {
  id: string;
  subject: string;
  percentage: number;
};

type AttendanceOverviewProps = {
  overallPercentage: number | null;
  subjects: AttendanceSubject[];
};

function getAttendanceStatus(percentage: number) {
  if (percentage < 75) {
    return {
      label: "Needs attention",
      className: "text-red-600",
    };
  }

  if (percentage < 80) {
    return {
      label: "Watch closely",
      className: "text-amber-600",
    };
  }

  return {
    label: "Healthy",
    className: "text-green-600",
  };
}

export function AttendanceOverview({
  overallPercentage,
  subjects,
}: AttendanceOverviewProps) {
  const overall =
    overallPercentage === null
      ? null
      : Math.round(overallPercentage);

  const status =
    overall === null
      ? null
      : getAttendanceStatus(overall);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Attendance
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your current attendance overview.
          </p>
        </div>

        {status && (
          <span
            className={`text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-end justify-between">
          <span className="text-4xl font-bold text-foreground">
            {overall === null ? "—" : `${overall}%`}
          </span>

          <span className="text-xs text-muted-foreground">
            Target: 75%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{
              width: `${Math.min(overall ?? 0, 100)}%`,
            }}
          />
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="mt-6 space-y-4">
          {subjects.map((subject) => (
            <div key={subject.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {subject.subject}
                </span>

                <span className="text-muted-foreground">
                  {Math.round(subject.percentage)}%
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{
                    width: `${Math.min(subject.percentage, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}