import { PageHeader } from "@/components/layout/page-header";
import { NotificationSettingsForm } from "@/components/notifications/notification-settings-form";
import { getNotificationSettingsData } from "@/services/notifications/notification-settings-data";

export default async function NotificationSettingsPage() {
  const data =
    await getNotificationSettingsData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Personalization"
        title="Notification Settings"
        description="Control what CampusMate reminds you about, how early it reminds you, and when you want quiet hours."
      />

      <NotificationSettingsForm
        initialSettings={
          data.settings
        }
      />
    </div>
  );
}