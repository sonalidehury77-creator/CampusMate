"use client";

import { useMemo } from "react";

import type {
  ExamIntelligenceData,
} from "@/types/examination";

import {
  updateExamRevisionItemStatus,
} from "@/services/examination/examination-actions";

type Props = {
  data: ExamIntelligenceData;
};

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeZone:
        "Asia/Kolkata",
    },
  ).format(
    new Date(
      `${value}T00:00:00+05:30`,
    ),
  );
}

function formatMinutes(
  minutes: number,
): string {
  if (
    minutes < 60
  ) {
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

export function ExaminationPageContent({
  data,
}: Props) {
  const nextExam =
    data.upcomingExams[0];

  const readinessLabel =
    useMemo(() => {
      switch (
        data.preparationSummary
          .readiness
      ) {
        case "ready":
          return "Ready";

        case "nearly_ready":
          return "Nearly ready";

        case "in_progress":
          return "Preparation in progress";

        case "needs_preparation":
          return "Needs preparation";

        default:
          return "Not started";
      }
    }, [
      data.preparationSummary
        .readiness,
    ]);

  return (
    <div className="space-y-8">
      {nextExam && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-brand-600">
                Next examination
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {nextExam.subjectName}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {nextExam.subjectCode}
                {nextExam.examType
                  ? ` • ${nextExam.examType}`
                  : ""}
              </p>

              <p className="mt-4 text-sm">
                {formatDate(
                  nextExam.examDate,
                )}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {nextExam.startTime ??
                  "Time not assigned"}
                {" – "}
                {nextExam.endTime ??
                  "End time not assigned"}
                {" • "}
                {nextExam.room ??
                  "Room not assigned"}
              </p>
            </div>

            <div className="rounded-2xl bg-muted p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {nextExam.status ===
                "today"
                  ? "Exam today"
                  : "Days remaining"}
              </p>

              <p className="mt-1 text-4xl font-bold">
                {nextExam.status ===
                "today"
                  ? "Today"
                  : nextExam.daysRemaining}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Upcoming exams
          </p>

          <p className="mt-2 text-3xl font-bold">
            {data.upcomingExams.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Syllabus coverage
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              data.preparationSummary
                .overallCoveragePercentage
            }%
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Weak topics
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              data.preparationSummary
                .weakTopics
            }
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Readiness
          </p>

          <p className="mt-2 text-xl font-bold">
            {readinessLabel}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Exam timetable
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Upcoming examinations
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-muted">
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3">
                    Subject
                  </th>

                  <th className="px-4 py-3">
                    Date
                  </th>

                  <th className="px-4 py-3">
                    Time
                  </th>

                  <th className="px-4 py-3">
                    Room
                  </th>

                  <th className="px-4 py-3">
                    Countdown
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.upcomingExams.map(
                  (exam) => (
                    <tr
                      key={exam.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium">
                          {exam.subjectName}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {exam.subjectCode}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {formatDate(
                          exam.examDate,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {exam.startTime ??
                          "Not assigned"}
                      </td>

                      <td className="px-4 py-4">
                        {exam.room ??
                          "Not assigned"}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {exam.status ===
                        "today"
                          ? "Today"
                          : `${exam.daysRemaining} days`}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Preparation
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Subject preparation
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {data.subjectPreparation.map(
            (subject) => (
              <div
                key={
                  subject.examId
                }
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {
                        subject.subjectName
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {
                        subject.subjectCode
                      }
                    </p>
                  </div>

                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {
                      subject.daysRemaining
                    }{" "}
                    days
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>
                        Coverage
                      </span>

                      <span className="font-semibold">
                        {
                          subject.coveragePercentage
                        }%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{
                          width: `${subject.coveragePercentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-lg font-bold">
                        {
                          subject.totalTopics
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Topics
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-lg font-bold">
                        {
                          subject.completedTopics
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Completed
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-lg font-bold">
                        {
                          subject.weakTopics
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Weak
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Estimated study time:{" "}
                    <span className="font-medium text-foreground">
                      {formatMinutes(
                        subject.estimatedMinutes,
                      )}
                    </span>
                  </div>

                  <div className="text-sm">
                    Readiness:{" "}
                    <span className="font-semibold">
                      {
                        subject.readiness
                      }
                    </span>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Weak-topic detection
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Topics needing more attention
          </h2>
        </div>

        {data.topicProgress.filter(
          (topic) =>
            topic.isWeak,
        ).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="font-medium">
              No weak topics detected
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Weak topics will be identified
              from coverage and confidence
              data.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.topicProgress
              .filter(
                (topic) =>
                  topic.isWeak,
              )
              .map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <p className="font-semibold">
                    {
                      topic.topicName
                    }
                  </p>

                  {topic.unitName && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {
                        topic.unitName
                      }
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">
                        Coverage
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {
                          topic.coveragePercentage
                        }%
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">
                        Confidence
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {
                          topic.confidenceLevel
                        }%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Revision plan
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Your scheduled revision
          </h2>
        </div>

        {!data.revisionPlan ? (
          <div className="rounded-2xl border border-dashed border-border p-8">
            <p className="font-medium">
              No revision plan created yet
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Generate or create a plan after
              reviewing your upcoming exam and
              weak topics.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold">
                {
                  data.revisionPlan
                    .title
                }
              </h3>

              {data.revisionPlan
                .description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {
                    data.revisionPlan
                      .description
                  }
                </p>
              )}

              <p className="mt-3 text-sm text-muted-foreground">
                {
                  data.revisionPlan
                    .availableMinutesPerDay
                }{" "}
                minutes available per day
              </p>
            </div>

            <div className="space-y-3">
              {data.revisionPlan.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {item.title}
                      </p>

                      {item.topicName && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {
                            item.topicName
                          }
                        </p>
                      )}

                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(
                          item.scheduledDate,
                        )}{" "}
                        •{" "}
                        {
                          item.plannedMinutes
                        }{" "}
                        minutes
                      </p>
                    </div>

                    <button
                      type="button"
                      className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                      onClick={async () => {
                        await updateExamRevisionItemStatus(
                          {
                            itemId:
                              item.id,

                            status:
                              item.status ===
                              "completed"
                                ? "pending"
                                : "completed",

                            actualMinutes:
                              item.status ===
                              "completed"
                                ? 0
                                : item.plannedMinutes,
                          },
                        );

                        window.location.reload();
                      }}
                    >
                      {item.status ===
                      "completed"
                        ? "Mark pending"
                        : "Complete"}
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Exam performance
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Performance history
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Evaluated exams
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                data.performanceSummary
                  .evaluatedExams
              }
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Average
            </p>

            <p className="mt-2 text-3xl font-bold">
              {data.performanceSummary
                .averagePercentage ??
                "—"}
              {data.performanceSummary
                .averagePercentage !==
                null &&
                "%"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Highest
            </p>

            <p className="mt-2 text-3xl font-bold">
              {data.performanceSummary
                .highestPercentage ??
                "—"}
              {data.performanceSummary
                .highestPercentage !==
                null &&
                "%"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Lowest
            </p>

            <p className="mt-2 text-3xl font-bold">
              {data.performanceSummary
                .lowestPercentage ??
                "—"}
              {data.performanceSummary
                .lowestPercentage !==
                null &&
                "%"}
            </p>
          </div>
        </div>

        {data.performance.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8">
            <p className="font-medium">
              No exam performance recorded
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Performance information will
              appear after exam results are
              entered.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-muted">
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3">
                      Exam
                    </th>

                    <th className="px-4 py-3">
                      Marks
                    </th>

                    <th className="px-4 py-3">
                      Percentage
                    </th>

                    <th className="px-4 py-3">
                      Grade
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.performance.map(
                    (item) => {
                      const exam =
                        data.exams.find(
                          (exam) =>
                            exam.id ===
                            item.examId,
                        );

                      return (
                        <tr
                          key={
                            item.id
                          }
                          className="border-b border-border last:border-b-0"
                        >
                          <td className="px-4 py-4">
                            {exam?.subjectName ??
                              "Exam"}
                          </td>

                          <td className="px-4 py-4">
                            {item.marks ??
                              "—"}
                            {item.maxMarks !==
                              null &&
                              ` / ${item.maxMarks}`}
                          </td>

                          <td className="px-4 py-4 font-semibold">
                            {item.percentage ??
                              "—"}
                            {item.percentage !==
                              null &&
                              "%"}
                          </td>

                          <td className="px-4 py-4">
                            {item.grade ??
                              "—"}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}