import Link from "next/link";

type SmartNotification = {
  id: string;
  title: string;
  message: string;
  priority: string;
  createdAt: string;
  href: string | null;
};

type SmartNotificationCardProps = {
  notifications: SmartNotification[];
};

export function SmartNotificationCard({
  notifications,
}: SmartNotificationCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-700">
            CampusMate Intelligence
          </p>

          <h2 className="mt-1 text-xl font-bold text-foreground">
            Things that need your attention
          </h2>
        </div>

        <Link
          href="/notifications"
          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          View all →
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="mt-6 rounded-xl bg-muted p-5">
          <p className="font-medium text-foreground">
            You&apos;re all caught up.
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            CampusMate will show important reminders here when something needs
            your attention.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={
                    notification.priority === "urgent"
                      ? "mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500"
                      : notification.priority === "important"
                        ? "mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500"
                        : "mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500"
                  }
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    {notification.title}
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {notification.message}
                  </p>

                  {notification.href && (
                    <Link
                      href={notification.href}
                      className="mt-2 inline-flex text-xs font-semibold text-brand-700"
                    >
                      Open →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}