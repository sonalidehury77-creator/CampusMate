import { PageHeader } from "@/components/layout/page-header";
import { StudyPlannerPageClient } from "@/components/study-planner/study-planner-page-client";
import { getStudyPlannerData } from "@/services/study-planner/study-planner-data";

export default async function StudyPlannerPage() {
  const data = await getStudyPlannerData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Personal productivity"
        title="Study Planner"
        description="Plan your study time, organize academic tasks and build consistent focus habits."
      />

      <StudyPlannerPageClient data={data} />
    </div>
  );
}