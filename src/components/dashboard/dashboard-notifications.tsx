type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  priority: string;
  createdAt: string;
};

type DashboardNotificationsProps = {
  notifications: DashboardNotification[];
};

export function DashboardNotifications({
  notifications,
}: DashboardNotificationsProps) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="text-lg font-semibold text-foreground">
          Important notifications
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Recent information that may need your attention.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="p-5">
          <p className="text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-5"
            >
              <div className="flex gap-3">
                <div className="mt-1 size-2 shrink-0 rounded-full bg-brand-500" />

                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {notification.title}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {notification.createdAt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}