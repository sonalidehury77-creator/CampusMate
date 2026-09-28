import { createClient } from "@/lib/supabase/server";

export default async function AdminSystemAnalyticsPage() {
  const supabase = await createClient();

  const [
    profilesResult,
    studentsResult,
    facultyResult,
    noticesResult,
    notificationsResult,
    auditResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, role, created_at"),

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
      .from("notices")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("notifications")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("audit_logs")
      .select("id", {
        count: "exact",
        head: true,
      }),
  ]);

  const errors = [
    profilesResult.error,
    studentsResult.error,
    facultyResult.error,
    noticesResult.error,
    notificationsResult.error,
    auditResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(
      `Failed to load system analytics: ${
        errors[0]?.message ?? "Unknown error"
      }`,
    );
  }

  const profiles = profilesResult.data ?? [];

  const roleCounts = profiles.reduce(
    (result, profile) => {
      const role = profile.role ?? "unknown";

      result[role] =
        (result[role] ?? 0) + 1;

      return result;
    },
    {} as Record<string, number>,
  );

  const metrics = [
    {
      label: "Profiles",
      value: profiles.length,
    },
    {
      label: "Students",
      value: studentsResult.count ?? 0,
    },
    {
      label: "Faculty",
      value: facultyResult.count ?? 0,
    },
    {
      label: "Notices",
      value: noticesResult.count ?? 0,
    },
    {
      label: "Notifications",
      value: notificationsResult.count ?? 0,
    },
    {
      label: "Audit Events",
      value: auditResult.count ?? 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Platform Intelligence
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          System Analytics
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Administrative overview of CampusMate platform
          activity and account distribution.
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
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-indigo-600">
          Account distribution
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Roles
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {Object.entries(roleCounts).map(
            ([role, count]) => (
              <div
                key={role}
                className="rounded-xl bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {role}
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {count}
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm font-semibold text-amber-700">
          Security visibility
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Audit logging is connected
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          CampusMate can use the existing audit log
          foundation to provide a detailed administrative
          activity timeline as the platform mutation
          workflows become more extensive.
        </p>
      </section>
    </div>
  );
}