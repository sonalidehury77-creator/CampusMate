import Link from "next/link";

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

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default async function FacultyPage() {
  const data =
    await getFacultyDashboardData();

  const {
    faculty,
    subjects,
    todayClasses,
    assignments,
    attendanceSessions,
    intelligence,
  } = data;

  return (
    <main className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-indigo-200">
            Faculty Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Good morning,{" "}
            {faculty.name}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            Manage your teaching workflow,
            assignments, attendance and
            academic activity from one
            intelligent workspace.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/faculty/assignments"
            className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15"
          >
            <p className="font-semibold">
              Create Assignment
            </p>

            <p className="mt-1 text-xs text-slate-300">
              Add work for students
            </p>
          </Link>

          <Link
            href="/faculty/attendance"
            className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15"
          >
            <p className="font-semibold">
              Take Attendance
            </p>

            <p className="mt-1 text-xs text-slate-300">
              Record today class
            </p>
          </Link>

          <Link
            href="/faculty/timetable"
            className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15"
          >
            <p className="font-semibold">
              View Timetable
            </p>

            <p className="mt-1 text-xs text-slate-300">
              Check your teaching schedule
            </p>
          </Link>

          <Link
            href="/faculty/intelligence"
            className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15"
          >
            <p className="font-semibold">
              Faculty Intelligence
            </p>

            <p className="mt-1 text-xs text-slate-300">
              Review teaching insights
            </p>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Subjects"
          value={
            intelligence.metrics
              .assignedSubjects
          }
          description="Subjects currently assigned to you."
        />

        <MetricCard
          label="Students"
          value={
            intelligence.metrics
              .totalStudents
          }
          description="Students across your assigned subjects."
        />

        <MetricCard
          label="Assignments"
          value={
            intelligence.metrics
              .totalAssignments
          }
          description="Assignments currently linked to you."
        />

        <MetricCard
          label="Attendance Sessions"
          value={
            intelligence.metrics
              .attendanceSessions
          }
          description="Recorded attendance sessions."
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Today Classes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your scheduled teaching sessions.
              </p>
            </div>

            <Link
              href="/faculty/timetable"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Full timetable
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {todayClasses.length ===
            0 ? (
              <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                No classes are scheduled
                for today.
              </div>
            ) : (
              todayClasses.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">
                        {item.subjectCode} ·{" "}
                        {item.subjectName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.startTime} –{" "}
                        {item.endTime}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700">
                      Room{" "}
                      {item.room ??
                        "Not assigned"}
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Faculty Intelligence
          </p>

          <p className="mt-2 text-4xl font-bold text-slate-950">
            {
              intelligence.overallScore
            }
            <span className="text-lg text-slate-400">
              /100
            </span>
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Combined teaching activity,
            assignment activity,
            attendance activity and
            engagement indicators.
          </p>

          <Link
            href="/faculty/intelligence"
            className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            View intelligence
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                My Subjects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Teaching workload overview.
              </p>
            </div>

            <Link
              href="/faculty/subjects"
              className="text-sm font-semibold text-indigo-600"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {subjects.map(
              (subject) => (
                <div
                  key={subject.id}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {subject.subjectCode}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {subject.subjectName}
                      </p>
                    </div>

                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {subject.studentCount}{" "}
                      students
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                    <span>
                      {subject.assignmentCount}{" "}
                      assignments
                    </span>

                    <span>
                      {
                        subject.attendanceSessionCount
                      }{" "}
                      attendance sessions
                    </span>
                  </div>
                </div>
              ),
            )}

            {subjects.length === 0 && (
              <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                No subjects are currently
                assigned to your faculty
                profile.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Upcoming Assignments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recent assignments and deadlines.
              </p>
            </div>

            <Link
              href="/faculty/assignments"
              className="text-sm font-semibold text-indigo-600"
            >
              Manage
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {assignments
              .slice(0, 5)
              .map(
                (assignment) => (
                  <div
                    key={
                      assignment.id
                    }
                    className="rounded-xl border border-slate-100 p-4"
                  >
                    <p className="font-semibold text-slate-950">
                      {assignment.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        assignment.subjectCode
                      }{" "}
                      ·{" "}
                      {
                        assignment.subjectName
                      }
                    </p>

                    <p className="mt-3 text-xs font-medium text-slate-600">
                      Due{" "}
                      {formatDate(
                        assignment.dueDate,
                      )}
                    </p>
                  </div>
                ),
              )}

            {assignments.length ===
              0 && (
              <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                No assignments found.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Recent Attendance Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest recorded teaching sessions.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {attendanceSessions
            .slice(0, 6)
            .map(
              (session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <p className="font-semibold text-slate-950">
                    {session.subjectCode}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {session.subjectName}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {
                        session.sessionDate
                      }
                    </span>

                    <span className="font-bold text-emerald-600">
                      {
                        session.attendancePercentage
                      }
                      %
                    </span>
                  </div>
                </div>
              ),
            )}

          {attendanceSessions.length ===
            0 && (
            <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              No attendance sessions
              recorded yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}