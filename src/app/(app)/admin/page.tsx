import Link from "next/link";

import { getAdminDashboardData } from "@/services/admin/admin-data";

function MetricCard({
  label,
  value,
  href,
  description,
}: {
  label: string;
  value: number;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-950">
        {value.toLocaleString()}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold text-indigo-600">
          CampusMate Administration
        </p>

        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Admin Dashboard
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Central control center for students, faculty,
              academic structure, campus communication and
              system intelligence.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold text-emerald-700">
              System status
            </p>

            <p className="mt-1 text-sm font-bold text-emerald-900">
              Operational
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Students"
          value={data.summary.students}
          href="/admin/students"
          description="Registered student identities"
        />

        <MetricCard
          label="Faculty"
          value={data.summary.faculty}
          href="/admin/faculty"
          description="Teaching staff records"
        />

        <MetricCard
          label="Subjects"
          value={data.summary.subjects}
          href="/admin/subjects"
          description="Academic subjects"
        />

        <MetricCard
          label="Departments"
          value={data.summary.departments}
          href="/admin/departments"
          description="Academic departments"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Total Users"
          value={data.summary.totalUsers}
          href="/admin/system-analytics"
          description="All CampusMate profiles"
        />

        <MetricCard
          label="Published Notices"
          value={data.summary.publishedNotices}
          href="/admin/notices"
          description="Currently published notices"
        />

        <MetricCard
          label="Unread Notifications"
          value={data.summary.unreadNotifications}
          href="/admin/notifications"
          description="Recent notification activity"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600">
                Communication
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Recent notices
              </h2>
            </div>

            <Link
              href="/admin/notices"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Manage →
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {data.recentNotices.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No notices have been created yet.
              </p>
            ) : (
              data.recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {notice.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {notice.status ?? "unknown"}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {notice.priority ?? "normal"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-indigo-600">
            Administration
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Quick actions
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/students"
              className="rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
            >
              <p className="font-semibold text-slate-900">
                Student Management
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Search and inspect student records.
              </p>
            </Link>

            <Link
              href="/admin/faculty"
              className="rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
            >
              <p className="font-semibold text-slate-900">
                Faculty Management
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Review teaching staff.
              </p>
            </Link>

            <Link
              href="/admin/analytics"
              className="rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
            >
              <p className="font-semibold text-slate-900">
                Academic Analytics
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Monitor academic activity.
              </p>
            </Link>

            <Link
              href="/admin/system-analytics"
              className="rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
            >
              <p className="font-semibold text-slate-900">
                System Analytics
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Monitor platform usage.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}