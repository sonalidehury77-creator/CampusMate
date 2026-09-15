import { PageHeader } from "@/components/layout/page-header";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { getNotificationsData } from "@/services/notifications/notifications-data";

export default async function NotificationsPage() {
  const data =
    await getNotificationsData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Stay informed"
        title="Notifications"
        description="CampusMate keeps important academic and campus updates in one intelligent notification center."
      />

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