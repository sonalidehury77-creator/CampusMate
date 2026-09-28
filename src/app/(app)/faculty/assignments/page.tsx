import Link from "next/link";
import { requireFaculty } from "@/lib/auth/require-faculty";
import {
  getFacultyDashboardData,
} from "@/services/faculty/faculty-data";
function formatDate(
  value: string | null,
) {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

export default async function FacultyAssignmentsPage() {
  await requireFaculty();

    const data =
    await getFacultyDashboardData();

  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Faculty Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Assignment Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create and manage assignments for your subjects.
          </p>
        </div>

        <Link
          href="/faculty/assignments/new"
          className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          + Create Assignment
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              data.assignments
                .length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            With Deadline
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              data.assignments.filter(
                (item) =>
                  item.dueDate !==
                  null,
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            High Priority
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-600">
            {
              data.assignments.filter(
                (item) =>
                  item.priority ===
                    "high" ||
                  item.priority ===
                    "urgent",
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Subjects
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              data.subjects
                .length
            }
          </p>
        </div>
      </section>

      <section className="space-y-4">
        {data.assignments.map(
          (assignment) => (
            <article
              key={assignment.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                    {
                      assignment.subjectCode
                    }
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {
                      assignment.title
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      assignment.subjectName
                    }
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {
                    assignment.priority
                  }
                </span>
              </div>

              {assignment.description && (
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {
                    assignment.description
                  }
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
                <span>
                  Due:{" "}
                  {formatDate(
                    assignment.dueDate,
                  )}
                </span>

                <span>
                  Created:{" "}
                  {formatDate(
                    assignment.createdAt,
                  )}
                </span>
              </div>

              <div className="mt-5 flex gap-2">
                <Link
                  href={`/faculty/assignments/${assignment.id}`}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  Manage
                </Link>
              </div>
            </article>
          ),
        )}

        {data.assignments.length ===
          0 && (
          <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
            No assignments have been created yet.
          </div>
        )}
      </section>
    </main>
  );
}