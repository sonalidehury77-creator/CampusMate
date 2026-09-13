import { PageHeader } from "@/components/layout/page-header";
import { ResourcesPageClient } from "@/components/resources/resources-page-client";
import { getResourcesData } from "@/services/resources/resources-data";

export default async function ResourcesPage() {
  const data = await getResourcesData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academic resources"
        title="Notes & Resources"
        description="Organize your study materials, previous-year questions, notes, documents and useful academic resources in one place."
      />

      <ResourcesPageClient data={data} />
    </div>
  );
}