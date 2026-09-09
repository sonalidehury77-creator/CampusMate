type AcademicHealthProps = {
  attendance: number | null;
  assignmentCompletion: number | null;
  studyProgress: number | null;
};

function getHealthLabel(score: number) {
  if (score >= 80) {
    return "Excellent";
  }

  if (score >= 70) {
    return "Good";
  }

  if (score >= 60) {
    return "Needs attention";
  }

  return "At risk";
}

export function AcademicHealth({
  attendance,
  assignmentCompletion,
  studyProgress,
}: AcademicHealthProps) {
  const values = [
    attendance,
    assignmentCompletion,
    studyProgress,
  ].filter(
    (value): value is number => value !== null,
  );

  const score =
    values.length > 0
      ? Math.round(
          values.reduce((sum, value) => sum + value, 0) /
            values.length,
        )
      : null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Academic Health
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          A quick view of your current academic condition.
        </p>
      </div>

      <div className="mt-6 flex items-center gap-5">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-full border-8 border-brand-100">
          <span className="text-xl font-bold text-foreground">
            {score === null ? "—" : score}
          </span>
        </div>

        <div>
          <p className="font-semibold text-foreground">
            {score === null
              ? "Not enough data"
              : getHealthLabel(score)}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            This score will become smarter as CampusMate
            collects more academic data.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <HealthRow
          label="Attendance"
          value={attendance}
        />

        <HealthRow
          label="Assignment completion"
          value={assignmentCompletion}
        />

        <HealthRow
          label="Study progress"
          value={studyProgress}
        />
      </div>
    </section>
  );
}

function HealthRow({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {label}
        </span>

        <span className="font-medium text-foreground">
          {value === null ? "—" : `${Math.round(value)}%`}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand-500"
          style={{
            width: `${Math.min(value ?? 0, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}