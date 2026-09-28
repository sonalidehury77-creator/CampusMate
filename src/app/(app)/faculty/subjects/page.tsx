import Link from "next/link";
import { requireFaculty } from "@/lib/auth/require-faculty";
import {
  getFacultyDashboardData,
} from "@/services/faculty/faculty-data";
export default async function FacultySubjectsPage() {
  await requireFaculty();

    const data =
    await getFacultyDashboardData();

  return (
    <main className="space-y-8">
      <section>
        <p className="text-sm font-medium text-indigo-600">
          Faculty Portal
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          My Subjects
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your assigned academic subjects and teaching activity.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {data.subjects.map(
          (subject) => (
            <article
              key={subject.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-indigo-600">
                    {subject.subjectCode}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {subject.subjectName}
                  </h2>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {
                    subject.academicYear
                  }
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-slate-950">
                    {
                      subject.studentCount
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Students
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-slate-950">
                    {
                      subject.assignmentCount
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Assignments
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-slate-950">
                    {
                      subject.attendanceSessionCount
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Sessions
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href={`/faculty/assignments?subject=${subject.subjectId}`}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Assignments
                </Link>

                <Link
                  href={`/faculty/attendance?subject=${subject.subjectId}`}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Attendance
                </Link>
              </div>
            </article>
          ),
        )}

        {data.subjects.length === 0 && (
          <div className="rounded-2xl bg-slate-50 p-8 text-sm text-slate-500">
            No faculty subjects are currently assigned.
          </div>
        )}
      </section>
    </main>
  );
}