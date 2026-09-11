import { PageHeader } from "@/components/layout/page-header";
import { AssignmentFilters } from "@/components/assignments/assignment-filters";
import { AssignmentStats } from "@/components/assignments/assignment-stats";
import { createClient } from "@/lib/supabase/server";
import { getAssignmentData } from "@/services/assignments/assignment-data";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsError
    ? null
    : claimsData?.claims;

  if (!claims?.sub) {
    return null;
  }

  const data =
    await getAssignmentData(
      claims.sub,
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academics"
        title="Assignments"
        description="Track deadlines, manage your progress, and keep every academic task under control."
      />

      <AssignmentStats
        stats={data.stats}
      />

      <AssignmentFilters
        assignments={
          data.assignments
        }
      />
    </div>
  );
}