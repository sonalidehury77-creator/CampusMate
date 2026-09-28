import { createClient } from "@/lib/supabase/server";

export default async function AdminNotificationsPage() {
  const supabase = await createClient();

  const {
    data: notifications,
    error,
  } = await supabase
    .from("notifications")
    .select(
      `
        id,
        recipient_profile_id,
        title,
        message,
        type,
        priority,
        related_entity_type,
        related_entity_id,
        read_at,
        created_at
      `,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  if (error) {
    throw new Error(
      `Failed to load notifications: ${error.message}`,
    );
  }

  const unread =
    (notifications ?? []).filter(
      (notification) =>
        notification.read_at === null,
    ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Campus Communication
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Notification Management
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Monitor notification activity across CampusMate.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-700">
            Unread
          </p>

          <p className="mt-1 text-lg font-bold text-amber-950">
            {unread}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {(notifications ?? []).map(
          (notification) => (
            <article
              key={notification.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-950">
                    {notification.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {notification.message}
                  </p>
                </div>

                <span
                  className={
                    notification.read_at
                      ? "rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500"
                      : "rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700"
                  }
                >
                  {notification.read_at
                    ? "Read"
                    : "Unread"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                <span>
                  Type: {notification.type}
                </span>

                <span>
                  Priority: {notification.priority}
                </span>

                <span>
                  Recipient:{" "}
                  {notification.recipient_profile_id}
                </span>
              </div>
            </article>
          ),
        )}

        {(notifications ?? []).length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
            No notification activity found.
          </div>
        )}
      </div>
    </div>
  );
}