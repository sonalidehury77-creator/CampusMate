import { redirect } from "next/navigation";

import { AcademicEmptyState } from "@/components/academics/academic-empty-state";
import { AcademicOverview } from "@/components/academics/academic-overview";
import { createClient } from "@/lib/supabase/server";
import { getAcademicData } from "@/services/academics/academic-data";

import { AcademicSubjects } from "./academic-subjects";

export default async function AcademicsPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsError
    ? null
    : claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  const data = await getAcademicData(
    claims.sub,
  );

  if (!data.semester) {
    return (
      <main className="space-y-6">
        <AcademicEmptyState
          title="Academic information is incomplete"
          description="Your current semester could not be loaded. Please check your student profile and academic setup."
        />
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <AcademicOverview
        semesterNumber={
          data.semester.semester_number
        }
        academicYear={
          data.semester.academic_year
        }
        programName={
          data.program?.name ?? null
        }
        programCode={
          data.program?.code ?? null
        }
        departmentName={
          data.department?.name ?? null
        }
        subjectCount={data.subjects.length}
        totalCredits={data.totalCredits}
        overallProgress={data.overallProgress}
        completedSubjects={
          data.completedSubjects
        }
      />

      {data.subjects.length === 0 ? (
        <AcademicEmptyState
          title="No subjects available yet"
          description={
            data.usingStudentSubjectMapping
              ? "Your student subject list is currently empty."
              : "No subjects have been added to your current semester yet. Once academic master data is added, they will appear here automatically."
          }
        />
      ) : (
        <AcademicSubjects
          subjects={data.subjects}
        />
      )}
    </main>
  );
}