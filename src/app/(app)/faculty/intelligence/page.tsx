import Link from "next/link";
import { requireFaculty } from "@/lib/auth/require-faculty";

import {
  getFacultyDashboardData,
} from "@/services/faculty/faculty-data";
function scoreClass(
  score: number,
) {
  if (score >= 80) {
    return "text-emerald-600";
  }

  if (score >= 60) {
    return "text-amber-600";
  }

  return "text-red-600";
}

export default async function FacultyIntelligencePage() {
  await requireFaculty();
    const data =
    await getFacultyDashboardData();

  const intelligence =
    data.intelligence;

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-indigo-600">
          Faculty Intelligence
        </p>

        <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Teaching Intelligence
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              CampusMate combines your teaching workload,
              assignment activity, attendance activity
              and student engagement into one faculty
              intelligence view.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 px-6 py-5 text-white">
            <p className="text-xs text-slate-400">
              Overall score
            </p>

            <p className="mt-1 text-4xl font-bold">
              {
                intelligence.overallScore
              }
              <span className="text-lg text-slate-400">
                /100
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Workload",
            score:
              intelligence.workloadScore,
          },
          {
            label: "Engagement",
            score:
              intelligence.engagementScore,
          },
          {
            label: "Attendance Activity",
            score:
              intelligence.attendanceActivityScore,
          },
          {
            label: "Assignment Activity",
            score:
              intelligence.assignmentActivityScore,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {item.label}
            </p>

            <p
              className={`mt-3 text-4xl font-bold ${scoreClass(
                item.score,
              )}`}
            >
              {item.score}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{
                  width: `${item.score}%`,
                }}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Intelligent Insights
          </h2>

          <div className="mt-5 space-y-3">
            {intelligence.insights.map(
              (insight, index) => (
                <div
                  key={`${insight.title}-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-950">
                    {insight.title}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {
                      insight.description
                    }
                  </p>

                  {insight.href && (
                    <Link
                      href={insight.href}
                      className="mt-3 inline-block text-sm font-semibold text-indigo-600"
                    >
                      Open module →
                    </Link>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Attention Required
          </h2>

          <div className="mt-5 space-y-3">
            {intelligence.risks.map(
              (risk) => (
                <div
                  key={risk.key}
                  className="rounded-xl border border-amber-100 bg-amber-50 p-4"
                >
                  <p className="font-semibold text-slate-950">
                    {risk.title}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {risk.description}
                  </p>

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Recommended:{" "}
                    {
                      risk.recommendedAction
                    }
                  </p>
                </div>
              ),
            )}

            {intelligence.risks.length ===
              0 && (
              <div className="rounded-xl bg-emerald-50 p-5 text-sm text-emerald-700">
                No immediate faculty risks detected.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Assigned Subjects
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              intelligence.metrics
                .assignedSubjects
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Total Students
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              intelligence.metrics
                .totalStudents
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Classes This Week
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              intelligence.metrics
                .classesThisWeek
            }
          </p>
        </div>
      </section>
    </main>
  );
}