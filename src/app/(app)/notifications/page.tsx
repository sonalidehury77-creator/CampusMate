import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { RefreshRemindersButton } from "@/components/notifications/refresh-reminders-button";
import { getNotificationsData } from "@/services/notifications/notifications-data";

export default async function NotificationsPage() {
  const data =
    await getNotificationsData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Campus Intelligence"
        title="Notifications"
        description="CampusMate monitors your academic activity and surfaces important information when it matters."
        actions={
          <div className="flex flex-wrap gap-2">
            <RefreshRemindersButton />

            <Link
              href="/notification-settings"
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Settings
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Unread
          </p>

          <p className="mt-2 text-3xl font-bold">
            {data.unreadCount}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Notifications waiting for you.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Smart
          </p>

          <p className="mt-2 text-3xl font-bold">
            Active
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Reminder engine monitors your academic data.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Personalization
          </p>

          <p className="mt-2 text-3xl font-bold">
            Ready
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Configure reminder timing and quiet hours.
          </p>
        </div>
      </div>

      <NotificationCenter
        notifications={
          data.notifications
        }
        unreadCount={
          data.unreadCount
        }
      />
    </div>
  );
}