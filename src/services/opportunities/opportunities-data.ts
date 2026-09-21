import { createClient } from "@/lib/supabase/server";

import type {
  Opportunity,
  OpportunityApplication,
  OpportunityApplicationStatus,
  OpportunityMatch,
  OpportunityMode,
  OpportunityStatus,
  OpportunitySummary,
  OpportunityType,
  OpportunitiesData,
} from "@/types/opportunities";

type CareerContext = {
  targetRole: string | null;
  targetIndustry: string | null;
  skills: string[];
  goalTypes: string[];
};

type OpportunityRow = {
  id: string;
  title: string;
  description: string | null;
  opportunity_type: string;
  provider_name: string | null;
  source_name: string | null;
  source_url: string | null;
  application_url: string | null;
  eligibility: string | null;
  required_documents: unknown;
  organization_type: string | null;
  industry: string | null;
  location: string | null;
  mode: string | null;
  amount: number | null;
  currency: string;
  deadline: string | null;
  starts_at: string | null;
  ends_at: string | null;
  tags: string[] | null;
  is_verified: boolean;
  is_featured: boolean;
  status: string;
  academic_year: string | null;
};

type ApplicationRow = {
  id: string;
  opportunity_id: string;
  student_id: string;
  status: string;
  applied_at: string | null;
  notes: string | null;
  completed_documents: unknown;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeOpportunityType(value: string): OpportunityType {
  const allowed: OpportunityType[] = [
    "scholarship",
    "internship",
    "hackathon",
    "competition",
    "workshop",
    "certification",
    "placement",
    "government",
    "fellowship",
    "research",
    "other",
  ];

  return allowed.includes(value as OpportunityType)
    ? (value as OpportunityType)
    : "other";
}

function normalizeStatus(value: string): OpportunityStatus {
  const allowed: OpportunityStatus[] = [
    "draft",
    "published",
    "closed",
    "archived",
  ];

  return allowed.includes(value as OpportunityStatus)
    ? (value as OpportunityStatus)
    : "published";
}

function normalizeApplicationStatus(
  value: string,
): OpportunityApplicationStatus {
  const allowed: OpportunityApplicationStatus[] = [
    "saved",
    "applied",
    "shortlisted",
    "selected",
    "rejected",
    "withdrawn",
  ];

  return allowed.includes(value as OpportunityApplicationStatus)
    ? (value as OpportunityApplicationStatus)
    : "saved";
}

function normalizeMode(value: string | null): OpportunityMode | null {
  if (
    value === "online" ||
    value === "offline" ||
    value === "hybrid"
  ) {
    return value;
  }

  return null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function normalizeOpportunity(
  row: OpportunityRow,
): Opportunity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,

    opportunityType: normalizeOpportunityType(
      row.opportunity_type,
    ),

    providerName: row.provider_name,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    applicationUrl: row.application_url,

    eligibility: row.eligibility,

    requiredDocuments:
      normalizeStringArray(row.required_documents),

    organizationType: row.organization_type,
    industry: row.industry,
    location: row.location,
    mode: normalizeMode(row.mode),

    amount:
      row.amount === null
        ? null
        : Number(row.amount),

    currency: row.currency,

    deadline: row.deadline,
    startsAt: row.starts_at,
    endsAt: row.ends_at,

    tags: Array.isArray(row.tags)
      ? row.tags
          .map((tag) => String(tag))
          .filter(Boolean)
      : [],

    isVerified: Boolean(row.is_verified),
    isFeatured: Boolean(row.is_featured),

    status: normalizeStatus(row.status),

    academicYear: row.academic_year,
  };
}

function normalizeApplication(
  row: ApplicationRow,
): OpportunityApplication {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    studentId: row.student_id,

    status: normalizeApplicationStatus(
      row.status,
    ),

    appliedAt: row.applied_at,
    notes: row.notes,

    completedDocuments:
      normalizeStringArray(
        row.completed_documents,
      ),

    reminderAt: row.reminder_at,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function tokenize(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]+/g, " ")
    .split(/\s+/)
    .filter(
      (token) =>
        token.length >= 2,
    );
}

function calculateMatch(
  opportunity: Opportunity,
  career: CareerContext,
): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  const searchable = [
    opportunity.title,
    opportunity.description,
    opportunity.industry,
    opportunity.eligibility,
    ...opportunity.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const roleTokens = tokenize(
    career.targetRole,
  );

  const industryTokens = tokenize(
    career.targetIndustry,
  );

  const skillTokens = career.skills.flatMap(
    (skill) => tokenize(skill),
  );

  const roleMatches = roleTokens.filter(
    (token) =>
      searchable.includes(token),
  );

  if (roleMatches.length > 0) {
    score += Math.min(
      25,
      roleMatches.length * 8,
    );

    reasons.push(
      "Matches your target career direction.",
    );
  }

  const industryMatches =
    industryTokens.filter(
      (token) =>
        searchable.includes(token),
    );

  if (industryMatches.length > 0) {
    score += Math.min(
      20,
      industryMatches.length * 7,
    );

    reasons.push(
      "Matches your target industry.",
    );
  }

  const skillMatches =
    skillTokens.filter(
      (token) =>
        searchable.includes(token),
    );

  if (skillMatches.length > 0) {
    score += Math.min(
      30,
      skillMatches.length * 5,
    );

    reasons.push(
      "Matches skills in your Career Center.",
    );
  }

  if (
    opportunity.isVerified
  ) {
    score += 10;

    reasons.push(
      "Verified source.",
    );
  }

  if (
    opportunity.isFeatured
  ) {
    score += 5;
  }

  if (
    opportunity.opportunityType ===
    "scholarship"
  ) {
    const scholarshipGoal =
      career.goalTypes.some(
        (goal) =>
          goal ===
            "higher_studies" ||
          goal ===
            "certification",
      );

    if (scholarshipGoal) {
      score += 10;

      reasons.push(
        "Relevant to your career goals.",
      );
    }
  }

  if (
    opportunity.opportunityType ===
      "internship" ||
    opportunity.opportunityType ===
      "placement"
  ) {
    const careerGoal =
      career.goalTypes.some(
        (goal) =>
          goal === "job" ||
          goal === "internship" ||
          goal === "placement",
      );

    if (careerGoal) {
      score += 10;

      reasons.push(
        "Matches your job/internship goals.",
      );
    }
  }

  return {
    score: Math.min(
      100,
      score,
    ),
    reasons: Array.from(
      new Set(reasons),
    ),
  };
}

function calculateDaysRemaining(
  deadline: string | null,
): number | null {
  if (!deadline) {
    return null;
  }

  const difference =
    new Date(deadline).getTime() -
    Date.now();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24),
  );
}

async function getCurrentStudent(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    throw new Error(
      "You must be signed in.",
    );
  }

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id")
    .eq(
      "profile_id",
      user.id,
    )
    .maybeSingle();

  if (studentError) {
    throw new Error(
      studentError.message,
    );
  }

  if (!student) {
    throw new Error(
      "Student profile was not found. Complete onboarding first.",
    );
  }

  return student;
}

async function getCareerContext(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  studentId: string,
): Promise<CareerContext> {
  const [
    profileResult,
    skillsResult,
    goalsResult,
  ] = await Promise.all([
    supabase
      .from("career_profiles")
      .select(
        "target_role, target_industry",
      )
      .eq(
        "student_id",
        studentId,
      )
      .maybeSingle(),

    supabase
      .from("student_career_skills")
      .select(
        `
          career_skills (
            name
          )
        `,
      )
      .eq(
        "student_id",
        studentId,
      ),

    supabase
      .from("career_goals")
      .select("goal_type")
      .eq(
        "student_id",
        studentId,
      ),
  ]);

  if (profileResult.error) {
    throw new Error(
      profileResult.error.message,
    );
  }

  if (skillsResult.error) {
    throw new Error(
      skillsResult.error.message,
    );
  }

  if (goalsResult.error) {
    throw new Error(
      goalsResult.error.message,
    );
  }

  const skillNames =
    (skillsResult.data ?? [])
      .flatMap((row) => {
        const skill =
          Array.isArray(
            row.career_skills,
          )
            ? row.career_skills[0]
            : row.career_skills;

        return skill?.name
          ? [String(skill.name)]
          : [];
      });

  return {
    targetRole:
      profileResult.data
        ?.target_role ?? null,

    targetIndustry:
      profileResult.data
        ?.target_industry ?? null,

    skills: skillNames,

    goalTypes:
      (goalsResult.data ?? []).map(
        (row) =>
          String(row.goal_type),
      ),
  };
}

export async function getOpportunitiesData(
  searchQuery = "",
  type = "all",
): Promise<OpportunitiesData> {
  const supabase =
    await createClient();

  const student =
    await getCurrentStudent(
      supabase,
    );

  const [
    opportunitiesResult,
    applicationsResult,
    career,
  ] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*")
      .eq(
        "status",
        "published",
      )
      .order(
        "is_featured",
        {
          ascending: false,
        },
      )
      .order(
        "deadline",
        {
          ascending: true,
          nullsFirst: false,
        },
      ),

    supabase
      .from(
        "opportunity_applications",
      )
      .select("*")
      .eq(
        "student_id",
        student.id,
      ),

    getCareerContext(
      supabase,
      student.id,
    ),
  ]);

  if (
    opportunitiesResult.error
  ) {
    throw new Error(
      opportunitiesResult.error.message,
    );
  }

  if (
    applicationsResult.error
  ) {
    throw new Error(
      applicationsResult.error.message,
    );
  }

  let opportunities =
    (
      opportunitiesResult.data ??
      []
    ).map((row) =>
      normalizeOpportunity(
        row as OpportunityRow,
      ),
    );

  const applications =
    (
      applicationsResult.data ??
      []
    ).map((row) =>
      normalizeApplication(
        row as ApplicationRow,
      ),
    );

  const cleanQuery =
    searchQuery.trim().toLowerCase();

  if (type !== "all") {
    opportunities =
      opportunities.filter(
        (opportunity) =>
          opportunity.opportunityType ===
          type,
      );
  }

  if (cleanQuery) {
    opportunities =
      opportunities.filter(
        (opportunity) => {
          const searchable = [
            opportunity.title,
            opportunity.description,
            opportunity.providerName,
            opportunity.industry,
            opportunity.location,
            ...opportunity.tags,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            cleanQuery,
          );
        },
      );
  }

  const applicationMap =
    new Map(
      applications.map(
        (application) => [
          application.opportunityId,
          application,
        ],
      ),
    );

  const matches: OpportunityMatch[] =
    opportunities.map(
      (opportunity) => {
        const match =
          calculateMatch(
            opportunity,
            career,
          );

        return {
          opportunity,
          application:
            applicationMap.get(
              opportunity.id,
            ) ?? null,
          matchScore:
            match.score,
          matchReasons:
            match.reasons,
          daysRemaining:
            calculateDaysRemaining(
              opportunity.deadline,
            ),
        };
      },
    );

  matches.sort(
    (a, b) => {
      if (
        a.matchScore !==
        b.matchScore
      ) {
        return (
          b.matchScore -
          a.matchScore
        );
      }

      const aDeadline =
        a.daysRemaining ??
        99999;

      const bDeadline =
        b.daysRemaining ??
        99999;

      return (
        aDeadline -
        bDeadline
      );
    },
  );

  const now =
    Date.now();

  const upcoming =
    matches.filter(
      (item) =>
        item.daysRemaining !==
          null &&
        item.daysRemaining >= 0 &&
        item.daysRemaining <= 30,
    ).length;

  const summary: OpportunitySummary =
    {
      total: matches.length,

      scholarships:
        matches.filter(
          (item) =>
            item.opportunity
              .opportunityType ===
            "scholarship",
        ).length,

      internships:
        matches.filter(
          (item) =>
            item.opportunity
              .opportunityType ===
            "internship",
        ).length,

      other:
        matches.filter(
          (item) =>
            item.opportunity
              .opportunityType !==
              "scholarship" &&
            item.opportunity
              .opportunityType !==
              "internship",
        ).length,

      saved:
        applications.filter(
          (application) =>
            application.status ===
            "saved",
        ).length,

      applied:
        applications.filter(
          (application) =>
            application.status ===
              "applied" ||
            application.status ===
              "shortlisted" ||
            application.status ===
              "selected",
        ).length,

      upcomingDeadlines:
        upcoming,
    };

  void now;

  return {
    opportunities: matches,
    summary,
  };
}

export async function getOpportunityById(
  id: string,
): Promise<OpportunityMatch | null> {
  const supabase =
    await createClient();

  const student =
    await getCurrentStudent(
      supabase,
    );

  const [
    opportunityResult,
    applicationResult,
    career,
  ] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*")
      .eq("id", id)
      .eq(
        "status",
        "published",
      )
      .maybeSingle(),

    supabase
      .from(
        "opportunity_applications",
      )
      .select("*")
      .eq(
        "opportunity_id",
        id,
      )
      .eq(
        "student_id",
        student.id,
      )
      .maybeSingle(),

    getCareerContext(
      supabase,
      student.id,
    ),
  ]);

  if (
    opportunityResult.error
  ) {
    throw new Error(
      opportunityResult.error.message,
    );
  }

  if (
    applicationResult.error
  ) {
    throw new Error(
      applicationResult.error.message,
    );
  }

  if (!opportunityResult.data) {
    return null;
  }

  const opportunity =
    normalizeOpportunity(
      opportunityResult.data as OpportunityRow,
    );

  const match =
    calculateMatch(
      opportunity,
      career,
    );

  return {
    opportunity,
    application:
      applicationResult.data
        ? normalizeApplication(
            applicationResult.data as ApplicationRow,
          )
        : null,
    matchScore:
      match.score,
    matchReasons:
      match.reasons,
    daysRemaining:
      calculateDaysRemaining(
        opportunity.deadline,
      ),
  };
}