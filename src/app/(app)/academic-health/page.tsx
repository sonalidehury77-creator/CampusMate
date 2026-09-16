import { PageHeader } from "@/components/layout/page-header";
import { HealthScoreCard } from "@/components/academic-health/health-score-card";
import { HealthBreakdown } from "@/components/academic-health/health-breakdown";
import { SubjectHealthList } from "@/components/academic-health/subject-health-list";
import { AcademicRisks } from "@/components/academic-health/academic-risks";
import { AcademicRecommendations } from "@/components/academic-health/academic-recommendations";

import { getAcademicHealthData } from "@/services/academic-health/academic-health-data";

export default async function AcademicHealthPage() {
  const data =
    await getAcademicHealthData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academic Intelligence"
        title="Academic Health"
        description="A personalized view of your academic progress, risks, consistency and readiness."
      />

      <HealthScoreCard
        score={data.overallScore}
        level={data.overallLevel}
        summary={data.summary}
      />

      <HealthBreakdown
        attendance={data.attendance}
        assignments={data.assignments}
        syllabus={data.syllabus}
        studyConsistency={
          data.studyConsistency
        }
        examReadiness={
          data.examReadiness
        }
      />

      <SubjectHealthList
        subjects={data.subjects}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AcademicRisks
          risks={data.risks}
        />

        <AcademicRecommendations
          recommendations={
            data.recommendations
          }
        />
      </div>
    </div>
  );
}