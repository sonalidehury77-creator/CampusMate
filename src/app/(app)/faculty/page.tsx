import Link from "next/link";

import { Card } from "@/components/ui/card";

import { getFacultyDashboardData } from "@/services/faculty/faculty-data";

export default async function FacultyDashboardPage() {
  const data =
    await getFacultyDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Faculty Workspace
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Teaching Dashboard
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your subjects, students, assignments,
          attendance and teaching performance.
        </p>
      </div>

      {/* Metrics */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="My Subjects"
          value={data.subjects.length}
        />

        <Metric
          label="Students"
          value={data.students.length}
        />

        <Metric
          label="Pending Submissions"
          value={data.pendingSubmissions}
        />

        <Metric
          label="Today's Classes"
          value={data.todayClasses.length}
        />
      </div>

      {/* Quick actions */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickLink
          href="/faculty/assignments"
          title="Assignments"
          description="Create, edit and review student work."
        />

        <QuickLink
          href="/faculty/attendance"
          title="Attendance"
          description="Create sessions and mark attendance."
        />

        <QuickLink
          href="/faculty/students"
          title="Students"
          description="Monitor student progress and risk."
        />

        <QuickLink
          href="/faculty/intelligence"
          title="Faculty Intelligence"
          description="View teaching insights and at-risk students."
        />
      </div>

      {/* Today's classes */}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Today Teaching Schedule
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Classes assigned to you today.
            </p>
          </div>

          <Link
            href="/faculty/timetable"
            className="text-sm font-semibold text-brand-600"
          >
            Full timetable →
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {data.todayClasses.length === 0 ? (
            <Empty text="No classes scheduled for today." />
          ) : (
            data.todayClasses.map(
              (entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {entry.subjectName}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {entry.subjectCode}
                      </p>
                    </div>

                    <div className="text-right text-sm">
                      <p className="font-medium">
                        {entry.start_time} –{" "}
                        {entry.end_time}
                      </p>

                      <p className="text-muted-foreground">
                        Room {entry.room ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )
          )}
        </div>
      </Card>

      {/* Assignment overview */}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Assignment Activity
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Recent teaching workload and submissions.
            </p>
          </div>

          <Link
            href="/faculty/assignments"
            className="text-sm font-semibold text-brand-600"
          >
            Manage →
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {data.assignments
            .slice(0, 5)
            .map(
              (assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {assignment.title}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {assignment.subjectName}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {assignment.gradedCount}/
                      {assignment.submissionCount}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      graded
                    </p>
                  </div>
                </div>
              ),
            )}
        </div>
      </Card>
    </div>
  );
}


function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </Card>
  );
}


function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-md">
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </Card>
    </Link>
  );
}


function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}