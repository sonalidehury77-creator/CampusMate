import { PageHeader } from "@/components/layout/page-header";
import { getSmartStudyData } from "@/services/study/smart-study-data";

function formatMinutes(
  minutes: number,
): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remaining =
    minutes % 60;

  return remaining === 0
    ? `${hours} hr`
    : `${hours} hr ${remaining} min`;
}

function priorityClass(
  priority: string,
): string {
  switch (priority) {
    case "critical":
      return "border-red-500/30 bg-red-500/10 text-red-700";

    case "high":
      return "border-orange-500/30 bg-orange-500/10 text-orange-700";

    case "medium":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-700";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export default async function StudyPage() {
  const data =
    await getSmartStudyData();

  const today =
    data.todayPlan;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academic Intelligence"
        title="Smart Study"
        description="Your adaptive study planner combines exams, deadlines, preparation, attendance and study performance."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Today&apos;s plan
          </p>

          <p className="mt-2 text-3xl font-bold">
            {formatMinutes(
              data.totalTodayMinutes,
            )}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            planned study
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Completed
          </p>

          <p className="mt-2 text-3xl font-bold">
            {formatMinutes(
              data.completedTodayMinutes,
            )}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            today
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Completion
          </p>

          <p className="mt-2 text-3xl font-bold">
            {data.completionPercentage}%
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(
                  100,
                  data.completionPercentage,
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Study streak
          </p>

          <p className="mt-2 text-3xl font-bold">
            {data.streakDays}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            consecutive days
          </p>
        </div>
      </section>

      {data.activeFocusSession && (
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">
                Focus session active
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Continue your study session
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                A study session is currently active.
              </p>
            </div>

            <a
              href={`/study/focus/${data.activeFocusSession.studyItemId ?? data.activeFocusSession.id}`}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Continue
            </a>
          </div>
        </section>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            Today&apos;s study plan
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Tasks are ordered according to academic urgency and preparation needs.
          </p>
        </div>

        {!today ||
        today.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <h3 className="font-semibold">
              No smart study plan yet
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Your study plan will appear here once enough academic data is available.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {today.items.map(
              (item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border bg-card p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass(
                            item.priority,
                          )}`}
                        >
                          {item.priority.toUpperCase()}
                        </span>

                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                          {item.studyType.replace(
                            "_",
                            " ",
                          )}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-semibold">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}

                      {item.recommendationReason.reasons.length >
                        0 && (
                        <ul className="mt-3 space-y-1">
                          {item.recommendationReason.reasons.map(
                            (
                              reason,
                            ) => (
                              <li
                                key={
                                  reason
                                }
                                className="text-sm text-muted-foreground"
                              >
                                • {reason}
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-2xl font-bold">
                        {item.plannedMinutes}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        minutes
                      </p>

                      <a
                        href={`/study/focus/${item.id}`}
                        className="mt-3 inline-flex rounded-xl border px-4 py-2 text-sm font-semibold"
                      >
                        Start focus
                      </a>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            Subject goals
          </h2>
        </div>

        {data.subjectGoals.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8">
            <p className="text-sm text-muted-foreground">
              No subject goals have been configured yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.subjectGoals.map(
              (goal) => (
                <div
                  key={goal.id}
                  className="rounded-2xl border bg-card p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Subject goal
                    </h3>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass(
                        goal.priority,
                      )}`}
                    >
                      {goal.priority}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">
                        Coverage target
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          goal.targetCoveragePercentage
                        }%
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">
                        Confidence target
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          goal.targetConfidencePercentage
                        }%
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">
                        Weekly target
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatMinutes(
                          goal.weeklyMinutes,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            Smart recommendations
          </h2>
        </div>

        {data.recommendations.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8">
            <p className="text-sm text-muted-foreground">
              Recommendations will appear as CampusMate analyzes your academic data.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.recommendations.map(
              (recommendation) => (
                <div
                  key={recommendation.id}
                  className="rounded-2xl border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass(
                          recommendation.priority,
                        )}`}
                      >
                        {
                          recommendation.priority
                        }
                      </span>

                      <h3 className="mt-3 font-semibold">
                        {
                          recommendation.title
                        }
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          recommendation.description
                        }
                      </p>

                      <p className="mt-3 text-sm font-medium">
                        Next action:{" "}
                        {
                          recommendation.action
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}