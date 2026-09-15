import { PageHeader } from "@/components/layout/page-header";
import { NoticeSummary } from "@/components/notices/notice-summary";
import { NoticesPageClient } from "@/components/notices/notices-page-client";
import { getNoticesData } from "@/services/notices/notices-data";

export default async function NoticesPage() {
  const data =
    await getNoticesData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Campus intelligence"
        title="Smart Notices"
        description="Never miss an important campus announcement, deadline, examination update, scholarship opportunity or placement notice."
      />

      <NoticeSummary
        total={data.summary.total}
        urgent={data.summary.urgent}
        important={
          data.summary.important
        }
        upcomingDeadlines={
          data.summary
            .upcomingDeadlines
        }
        overdue={
          data.summary.overdue
        }
      />

      <NoticesPageClient
        data={data}
      />
    </div>
  );
}