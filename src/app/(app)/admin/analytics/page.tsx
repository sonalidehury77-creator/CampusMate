import { createClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [
    studentsResult,
    facultyResult,
    subjectsResult,
    assignmentsResult,
    sessionsResult,
    examsResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("faculty")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("subjects")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("assignments")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("attendance_sessions")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("exams")
      .select("id", {
        count: "exact",
        head: true,
      }),
  ]);

  const errors = [
    studentsResult.error,
    facultyResult.error,
    subjectsResult.error,
    assignmentsResult.error,
    sessionsResult.error,
    examsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(
      `Failed to load academic analytics: ${
        errors[0]?.message ?? "Unknown error"
      }`,
    );
  }

  const metrics = [
    {
      label: "Students",
      value: studentsResult.count ?? 0,
      description:
        "Student records available for academic operations.",
    },
    {
      label: "Faculty",
      value: facultyResult.count ?? 0,
      description:
        "Faculty records participating in teaching.",
    },
    {
      label: "Subjects",
      value: subjectsResult.count ?? 0,
      description:
        "Subjects configured in the academic structure.",
    },
    {
      label: "Assignments",
      value: assignmentsResult.count ?? 0,
      description:
        "Assignment records across CampusMate.",
    },
    {
      label: "Attendance Sessions",
      value: sessionsResult.count ?? 0,
      description:
        "Recorded attendance sessions.",
    },
    {
      label: "Exams",
      value: examsResult.count ?? 0,
      description:
        "Examination records.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Intelligence
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Academic Analytics
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Administrative visibility into the academic
          activity currently recorded in CampusMate.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {metric.label}
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-950">
              {metric.value.toLocaleString()}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              {metric.description}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <p className="text-sm font-semibold text-indigo-700">
          Administrative intelligence
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Data foundation ready
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          These metrics are connected to CampusMate
          academic tables. In later analytics iterations,
          this workspace can calculate attendance risk,
          assignment completion, subject performance and
          department-level trends from the same underlying
          records.
        </p>
      </section>
    </div>
  );
}