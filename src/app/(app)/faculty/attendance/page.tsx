import Link from "next/link";
import { requireFaculty } from "@/lib/auth/require-faculty";
import {
  getFacultyDashboardData,
} from "@/services/faculty/faculty-data";
export default async function FacultyAttendancePage() {
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
            Attendance Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review recorded attendance sessions and student participation.
          </p>
        </div>

        <Link
          href="/faculty/attendance/new"
          className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          + New Attendance Session
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Sessions
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              data.attendanceSessions
                .length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Students Present
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {data.attendanceSessions.reduce(
              (sum, item) =>
                sum +
                item.presentCount,
              0,
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Students Absent
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {data.attendanceSessions.reduce(
              (sum, item) =>
                sum +
                item.absentCount,
              0,
            )}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {data.attendanceSessions.map(
          (session) => (
            <article
              key={session.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                    {
                      session.subjectCode
                    }
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    {
                      session.subjectName
                    }
                  </h2>
                </div>

                <span className="text-sm text-slate-500">
                  {
                    session.sessionDate
                  }
                </span>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Attendance
                  </span>

                  <span className="font-bold text-slate-950">
                    {
                      session.attendancePercentage
                    }
                    %
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${session.attendancePercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-bold text-slate-950">
                    {
                      session.studentCount
                    }
                  </p>

                  <p className="text-xs text-slate-500">
                    Total
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-lg font-bold text-emerald-700">
                    {
                      session.presentCount
                    }
                  </p>

                  <p className="text-xs text-emerald-600">
                    Present
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-3">
                  <p className="text-lg font-bold text-red-700">
                    {
                      session.absentCount
                    }
                  </p>

                  <p className="text-xs text-red-600">
                    Absent
                  </p>
                </div>
              </div>

              <Link
                href={`/faculty/attendance/${session.id}`}
                className="mt-5 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open session
              </Link>
            </article>
          ),
        )}

        {data.attendanceSessions.length ===
          0 && (
          <div className="rounded-2xl bg-slate-50 p-8 text-sm text-slate-500">
            No attendance sessions have been recorded yet.
          </div>
        )}
      </section>
    </main>
  );
}