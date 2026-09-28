import { createClient } from "@/lib/supabase/server";

export default async function AdminNoticesPage() {
  const supabase = await createClient();

  const {
    data: notices,
    error,
  } = await supabase
    .from("notices")
    .select(
      `
        id,
        title,
        description,
        category,
        priority,
        published_at,
        deadline,
        source,
        status,
        created_at
      `,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  if (error) {
    throw new Error(
      `Failed to load admin notices: ${error.message}`,
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Campus Communication
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Notice Management
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Monitor institutional notices and publication status.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {(notices ?? []).map((notice) => (
            <article
              key={notice.id}
              className="p-5 transition hover:bg-slate-50"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-slate-950">
                      {notice.title}
                    </h2>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {notice.priority}
                    </span>

                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                      {notice.status}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {notice.description}
                  </p>
                </div>

                <div className="shrink-0 text-xs text-slate-500">
                  {notice.published_at
                    ? new Date(
                        notice.published_at,
                      ).toLocaleDateString("en-IN")
                    : "Not published"}
                </div>
              </div>
            </article>
          ))}

          {(notices ?? []).length === 0 && (
            <div className="p-12 text-center text-sm text-slate-500">
              No notices found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}