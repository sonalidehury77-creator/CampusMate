type AcademicOverviewProps = {
  semesterNumber: number;
  academicYear: string;
  programName: string | null;
  programCode: string | null;
  departmentName: string | null;
  subjectCount: number;
  totalCredits: number;
  overallProgress: number;
  completedSubjects: number;
};

export function AcademicOverview({
  semesterNumber,
  academicYear,
  programName,
  programCode,
  departmentName,
  subjectCount,
  totalCredits,
  overallProgress,
  completedSubjects,
}: AcademicOverviewProps) {
  const cards = [
    {
      label: "Current semester",
      value: `Semester ${semesterNumber}`,
      description: academicYear,
      icon: "🎓",
    },
    {
      label: "Subjects",
      value: String(subjectCount),
      description: "Current academic load",
      icon: "📚",
    },
    {
      label: "Credits",
      value: String(totalCredits),
      description: "Total current-semester credits",
      icon: "⭐",
    },
    {
      label: "Syllabus progress",
      value: `${overallProgress}%`,
      description:
        completedSubjects > 0
          ? `${completedSubjects} subject${completedSubjects === 1 ? "" : "s"} completed`
          : "Keep making progress",
      icon: "📈",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-600">
              Academic overview
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your academics
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage your subjects, syllabus and learning
              progress from one place.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Programme
            </p>

            <p className="mt-1 font-semibold text-foreground">
              {programCode ?? "—"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {programName ?? departmentName ?? "Academic programme"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {card.value}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-lg">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}