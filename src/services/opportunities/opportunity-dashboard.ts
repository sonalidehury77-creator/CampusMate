import { createClient } from "@/lib/supabase/server";

export type OpportunityDashboardMatch = {
  id: string;
  title: string;
  opportunityType: string;
  deadline: string | null;
  isVerified: boolean;
};

export type OpportunityDashboardData = {
  topMatches: OpportunityDashboardMatch[];
  upcomingDeadlines: number;
  savedCount: number;
  appliedCount: number;
};

const emptyOpportunityDashboardData =
  (): OpportunityDashboardData => ({
    topMatches: [],
    upcomingDeadlines: 0,
    savedCount: 0,
    appliedCount: 0,
  });

export async function getOpportunityDashboardData(): Promise<OpportunityDashboardData> {
  const supabase = await createClient();

  // ============================================================
  // 1. GET CURRENT USER
  // ============================================================

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return emptyOpportunityDashboardData();
  }

  // ============================================================
  // 2. GET CURRENT STUDENT
  // ============================================================

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (studentError || !student) {
    return emptyOpportunityDashboardData();
  }

  // ============================================================
  // 3. LOAD PUBLISHED OPPORTUNITIES
  // ============================================================

  const {
    data: opportunityRows,
    error: opportunityError,
  } = await supabase
    .from("opportunities")
    .select(
      `
        id,
        title,
        opportunity_type,
        deadline,
        is_verified
      `,
    )
    .eq("status", "published")
    .order("is_featured", {
      ascending: false,
    })
    .order("deadline", {
      ascending: true,
      nullsFirst: false,
    })
    .limit(5);

  if (opportunityError) {
    console.error(
      "Failed to load opportunity dashboard data:",
      opportunityError,
    );

    return emptyOpportunityDashboardData();
  }

  // ============================================================
  // 4. NORMALIZE OPPORTUNITY ROWS
  //
  // Database uses snake_case.
  // Dashboard types use camelCase.
  // ============================================================

  const topMatches: OpportunityDashboardMatch[] = (
    opportunityRows ?? []
  ).map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.title,
    opportunityType:
      opportunity.opportunity_type,
    deadline:
      opportunity.deadline,
    isVerified:
      opportunity.is_verified,
  }));

  // ============================================================
  // 5. LOAD CURRENT STUDENT APPLICATIONS
  // ============================================================

  const {
    data: applicationRows,
    error: applicationError,
  } = await supabase
    .from("opportunity_applications")
    .select("status")
    .eq("student_id", student.id);

  if (applicationError) {
    console.error(
      "Failed to load opportunity applications:",
      applicationError,
    );

    return {
      topMatches,
      upcomingDeadlines: 0,
      savedCount: 0,
      appliedCount: 0,
    };
  }

  // ============================================================
  // 6. CALCULATE UPCOMING DEADLINES
  // ============================================================

  const now = Date.now();

  const upcomingDeadlines = (
    opportunityRows ?? []
  ).filter((opportunity) => {
    if (!opportunity.deadline) {
      return false;
    }

    const deadlineTime =
      new Date(
        opportunity.deadline,
      ).getTime();

    if (
      Number.isNaN(deadlineTime)
    ) {
      return false;
    }

    const daysRemaining = Math.ceil(
      (deadlineTime - now) /
        (1000 * 60 * 60 * 24),
    );

    return (
      daysRemaining >= 0 &&
      daysRemaining <= 30
    );
  }).length;

  // ============================================================
  // 7. CALCULATE SAVED COUNT
  // ============================================================

  const savedCount =
    (applicationRows ?? []).filter(
      (application) =>
        application.status ===
        "saved",
    ).length;

  // ============================================================
  // 8. CALCULATE ACTIVE APPLICATION COUNT
  //
  // Applied + shortlisted + selected are treated
  // as active application progress.
  // ============================================================

  const appliedCount =
    (applicationRows ?? []).filter(
      (application) =>
        application.status ===
          "applied" ||
        application.status ===
          "shortlisted" ||
        application.status ===
          "selected",
    ).length;

  // ============================================================
  // 9. RETURN NORMALIZED DASHBOARD DATA
  // ============================================================

  return {
    topMatches,
    upcomingDeadlines,
    savedCount,
    appliedCount,
  };
}