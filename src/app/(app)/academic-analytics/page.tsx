import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { getAcademicAnalyticsData } from "@/services/academic-analytics/academic-analytics-data";

function scoreLabel(
  score: number,
) {
  if (score >= 85) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Strong";
  }

  if (score >= 60) {
    return "Needs improvement";
  }

  return "Needs attention";
}

function riskClass(
  level: string,
) {
  if (level === "critical") {
    return "bg-red-100 text-red-700";
  }

  if (level === "high") {
    return "bg-orange-100 text-orange-700";
  }

  if (level === "moderate") {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-green-100 text-green-700";
}

export default async function AcademicAnalyticsPage() {
  const analytics =
    await getAcademicAnalyticsData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Academic Analytics"
        description="Understand your academic performance, trends, risks and improvement areas."
      />

      {/* ======================================================
          OVERALL SCORE
      ====================================================== */}

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">
              Overall Academic Score
            </p>

            <div className="mt-2 flex items-end gap-3">
              <span className="text-5xl font-bold text-foreground">
                {analytics.overallScore}
              </span>

              <span className="pb-2 text-sm text-muted-foreground">
                / 100
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {scoreLabel(
                analytics.overallScore,
              )}
            </p>
          </div>

          <Link
            href="/academic-health"
            className="inline-flex rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
          >
            View Academic Health
          </Link>
        </div>
      </section>

      {/* ======================================================
          KEY METRICS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Attendance
          </p>

          <p className="mt-2 text-3xl font-bold">
            {analytics.attendance.overall}%
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {analytics.attendance.attended} /{" "}
            {analytics.attendance.total} classes
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Assignment Completion
          </p>

          <p className="mt-2 text-3xl font-bold">
            {analytics.assignments.completionRate}%
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {analytics.assignments.completed} completed
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Study Completion
          </p>

          <p className="mt-2 text-3xl font-bold">
            {analytics.study.completionRate}%
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {analytics.study.totalMinutes} study minutes
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Exam Preparation
          </p>

          <p className="mt-2 text-3xl font-bold">
            {analytics.exams.preparationScore}%
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {analytics.exams.upcomingExams} upcoming exams
          </p>
        </div>
      </section>

      {/* ======================================================
          RISKS
      ====================================================== */}

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">
              Academic Risk Detection
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Areas requiring attention
            </h2>
          </div>
        </div>

        {analytics.risks.length === 0 ? (
          <div className="mt-5 rounded-xl bg-green-50 p-5 text-sm text-green-700">
            No major academic risks detected.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {analytics.risks.map(
              (risk) => (
                <div
                  key={risk.key}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {risk.title}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {risk.description}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${riskClass(
                        risk.level,
                      )}`}
                    >
                      {risk.level}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    Recommended action:{" "}
                    <span className="font-medium text-foreground">
                      {
                        risk.recommendedAction
                      }
                    </span>
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* ======================================================
          INSIGHTS
      ====================================================== */}

      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-semibold text-brand-600">
          CampusMate Insights
        </p>

        <h2 className="mt-1 text-xl font-bold">
          What your data is telling you
        </h2>

        <div className="mt-5 space-y-3">
          {analytics.insights.map(
            (insight, index) => (
              <div
                key={`${insight.title}-${index}`}
                className="rounded-xl bg-muted/50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-semibold">
                    {insight.title}
                  </h3>

                  {insight.href && (
                    <Link
                      href={
                        insight.href
                      }
                      className="text-sm font-medium text-brand-600"
                    >
                      Open
                    </Link>
                  )}
                </div>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {
                    insight.description
                  }
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      {/* ======================================================
          SUBJECT PERFORMANCE
      ====================================================== */}

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">
              Subject Intelligence
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Subject-by-subject performance
            </h2>
          </div>

          <Link
            href="/academics"
            className="text-sm font-medium text-brand-600"
          >
            Academics
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="px-3 py-3">
                  Subject
                </th>

                <th className="px-3 py-3">
                  Attendance
                </th>

                <th className="px-3 py-3">
                  Assignments
                </th>

                <th className="px-3 py-3">
                  Syllabus
                </th>

                <th className="px-3 py-3">
                  Score
                </th>

                <th className="px-3 py-3">
                  Risk
                </th>
              </tr>
            </thead>

            <tbody>
              {analytics.subjects.map(
                (subject) => (
                  <tr
                    key={
                      subject.subjectId
                    }
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-4">
                      <p className="font-medium">
                        {
                          subject.subjectName
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {
                          subject.subjectCode
                        }
                      </p>
                    </td>

                    <td className="px-3 py-4 text-sm">
                      {subject.attendance ===
                      null
                        ? "—"
                        : `${subject.attendance}%`}
                    </td>

                    <td className="px-3 py-4 text-sm">
                      {subject.assignmentCompletion ===
                      null
                        ? "—"
                        : `${subject.assignmentCompletion}%`}
                    </td>

                    <td className="px-3 py-4 text-sm">
                      {subject.syllabusProgress ===
                      null
                        ? "—"
                        : `${subject.syllabusProgress}%`}
                    </td>

                    <td className="px-3 py-4 font-semibold">
                      {
                        subject.performanceScore
                      }
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${riskClass(
                          subject.riskLevel,
                        )}`}
                      >
                        {
                          subject.riskLevel
                        }
                      </span>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================
          STRONG / WEAK SUBJECTS
      ====================================================== */}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold">
            Strongest Subjects
          </h2>

          <div className="mt-4 space-y-3">
            {analytics.strongestSubjects.map(
              (subject) => (
                <div
                  key={
                    subject.subjectId
                  }
                  className="flex items-center justify-between rounded-xl bg-muted/50 p-4"
                >
                  <div>
                    <p className="font-medium">
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

                  <span className="font-bold">
                    {
                      subject.performanceScore
                    }
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold">
            Subjects Needing Improvement
          </h2>

          <div className="mt-4 space-y-3">
            {analytics.weakestSubjects.map(
              (subject) => (
                <div
                  key={
                    subject.subjectId
                  }
                  className="flex items-center justify-between rounded-xl bg-muted/50 p-4"
                >
                  <div>
                    <p className="font-medium">
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

                  <span className="font-bold">
                    {
                      subject.performanceScore
                    }
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}