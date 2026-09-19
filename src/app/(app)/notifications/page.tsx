import { PageHeader } from "@/components/layout/page-header";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { getNotificationsData } from "@/services/notifications/notifications-data";
import { generateMySmartReminders } from "@/services/notifications/reminder-engine";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  try {
    await generateMySmartReminders();
  } catch (error) {
    console.error(
      "Smart reminder generation failed:",
      error,
    );
  }

  const data = await getNotificationsData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Stay informed"
        title="Notifications"
        description="CampusMate automatically watches your academic activity and creates useful reminders when something needs your attention."
      />

      <NotificationCenter
        notifications={data.notifications}
        unreadCount={data.unreadCount}
      />
    </div>
  );
}