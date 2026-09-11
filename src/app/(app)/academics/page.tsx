import { redirect } from "next/navigation";

import { AcademicOverview } from "@/components/academics/academic-overview";
import { SubjectGrid } from "@/components/academics/subject-grid";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { getAcademicData } from "@/services/academics/academic-data";

export default async function AcademicsPage() {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const claims = claimsError
    ? null
    : claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  const data = await getAcademicData(
    claims.sub,
  );

  return (
    <main className="space-y-8">
      <PageHeader
        eyebrow="Academics"
        title="Your academic workspace"
        description="Track your current semester, subjects, syllabus and study progress in one place."
      />

      <AcademicOverview data={data} />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Current semester subjects
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Open a subject to view its syllabus and
            update your progress.
          </p>
        </div>

        <SubjectGrid
          subjects={data.subjects}
        />
      </section>
    </main>
  );
}