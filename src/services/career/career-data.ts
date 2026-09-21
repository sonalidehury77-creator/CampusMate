import { createClient } from "@/lib/supabase/server";

import type {
  CareerCertification,
  CareerData,
  CareerGoal,
  CareerProfile,
  CareerProject,
  CareerRecommendation,
  CareerReadiness,
  StudentCareerSkill,
} from "@/types/career";

type RawCareerProfile = {
  id: string;
  student_id: string;
  target_role: string | null;
  target_industry: string | null;
  target_company_type: string | null;
  career_summary: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  availability_status: string | null;
};

type RawCareerSkill = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  is_technical: boolean | null;
};

type RawStudentCareerSkill = {
  id: string;
  skill_id: string;
  proficiency_level: number | null;
  years_experience: number | null;
  evidence: string | null;
};

type RawCareerProject = {
  id: string;
  title: string;
  description: string | null;
  project_type: string | null;
  status: string | null;
  github_url: string | null;
  live_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  featured: boolean | null;
};

type RawProjectSkill = {
  project_id: string;
  skill_id: string;
};

type RawCareerCertification = {
  id: string;
  name: string;
  issuing_organization: string | null;
  credential_id: string | null;
  credential_url: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  does_not_expire: boolean | null;
};

type RawCareerGoal = {
  id: string;
  title: string;
  description: string | null;
  goal_type: string | null;
  target_date: string | null;
  status: string | null;
  progress: number | null;
};

type RawCareerRecommendation = {
  id: string;
  skill_id: string | null;
  title: string;
  description: string | null;
  resource_url: string | null;
  priority: string | null;
  estimated_hours: number | null;
  status: string | null;
  source: string | null;
};

function normalizeAvailabilityStatus(
  value: string | null,
): CareerProfile["availabilityStatus"] {
  switch (value) {
    case "actively_looking":
      return "actively_looking";

    case "not_looking":
      return "not_looking";

    case "open_to_internships":
      return "open_to_internships";

    case "open_to_opportunities":
    default:
      return "open_to_opportunities";
  }
}

function normalizeProjectStatus(
  value: string | null,
): CareerProject["status"] {
  switch (value) {
    case "in_progress":
      return "in_progress";

    case "completed":
      return "completed";

    case "idea":
    default:
      return "idea";
  }
}

function normalizeGoalType(
  value: string | null,
): CareerGoal["goalType"] {
  switch (value) {
    case "job":
      return "job";

    case "internship":
      return "internship";

    case "placement":
      return "placement";

    case "higher_studies":
      return "higher_studies";

    case "freelancing":
      return "freelancing";

    case "entrepreneurship":
      return "entrepreneurship";

    case "certification":
      return "certification";

    default:
      return "job";
  }
}

function normalizeGoalStatus(
  value: string | null,
): CareerGoal["status"] {
  switch (value) {
    case "completed":
      return "completed";

    case "paused":
      return "paused";

    case "cancelled":
      return "cancelled";

    case "active":
    default:
      return "active";
  }
}

function normalizeRecommendationPriority(
  value: string | null,
): CareerRecommendation["priority"] {
  switch (value) {
    case "low":
      return "low";

    case "high":
      return "high";

    case "urgent":
      return "urgent";

    case "normal":
    default:
      return "normal";
  }
}

function normalizeRecommendationStatus(
  value: string | null,
): CareerRecommendation["status"] {
  switch (value) {
    case "in_progress":
      return "in_progress";

    case "completed":
      return "completed";

    case "dismissed":
      return "dismissed";

    case "recommended":
    default:
      return "recommended";
  }
}

function normalizeRecommendationSource(
  value: string | null,
): CareerRecommendation["source"] {
  switch (value) {
    case "ai":
      return "ai";

    case "manual":
      return "manual";

    case "system":
    default:
      return "system";
  }
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    Math.max(value, minimum),
    maximum,
  );
}

function calculateBasicReadiness(
  profile: CareerProfile | null,
  skills: StudentCareerSkill[],
  projects: CareerProject[],
  certifications: CareerCertification[],
  goals: CareerGoal[],
): CareerReadiness {
  const profileFields = profile
    ? [
        profile.targetRole,
        profile.targetIndustry,
        profile.targetCompanyType,
        profile.careerSummary,
        profile.githubUrl,
        profile.linkedinUrl,
        profile.portfolioUrl,
        profile.resumeUrl,
      ]
    : [];

  const profileScore =
    profileFields.length > 0
      ? Math.round(
          (profileFields.filter(
            (value) =>
              Boolean(value?.trim()),
          ).length /
            profileFields.length) *
            100,
        )
      : 0;

  const skillScore =
    skills.length > 0
      ? Math.round(
          (skills.reduce(
            (total, skill) =>
              total +
              skill.proficiencyLevel,
            0,
          ) /
            (skills.length * 5)) *
            100,
        )
      : 0;

  const projectScore =
    projects.length > 0
      ? Math.round(
          (projects.reduce(
            (total, project) => {
              let score = 0;

              if (
                project.status ===
                "completed"
              ) {
                score += 50;
              } else if (
                project.status ===
                "in_progress"
              ) {
                score += 30;
              } else {
                score += 10;
              }

              if (project.githubUrl) {
                score += 15;
              }

              if (project.liveUrl) {
                score += 15;
              }

              if (project.featured) {
                score += 20;
              }

              return total + score;
            },
            0,
          ) /
            (projects.length * 100)) *
            100,
        )
      : 0;

  const certificationScore =
    certifications.length > 0
      ? Math.min(
          certifications.length * 25,
          100,
        )
      : 0;

  const goalScore =
    goals.length > 0
      ? Math.round(
          goals.reduce(
            (total, goal) =>
              total + goal.progress,
            0,
          ) / goals.length,
        )
      : 0;

  const score = Math.round(
    profileScore * 0.2 +
      skillScore * 0.3 +
      projectScore * 0.25 +
      certificationScore * 0.1 +
      goalScore * 0.15,
  );

  const strengths: string[] = [];

  const strongSkills = skills
    .filter(
      (skill) =>
        skill.proficiencyLevel >= 4,
    )
    .slice(0, 3);

  for (const skill of strongSkills) {
    strengths.push(
      `${skill.name} is one of your stronger skills.`,
    );
  }

  if (
    projects.some(
      (project) =>
        project.status === "completed",
    )
  ) {
    strengths.push(
      "You have completed practical project experience.",
    );
  }

  if (certifications.length > 0) {
    strengths.push(
      "You have recorded professional learning achievements.",
    );
  }

  if (
    goals.some(
      (goal) =>
        goal.status === "active",
    )
  ) {
    strengths.push(
      "You have active career goals.",
    );
  }

  const recommendations: string[] = [];

  if (!profile) {
    recommendations.push(
      "Create your career profile.",
    );
  } else {
    if (!profile.targetRole) {
      recommendations.push(
        "Set a target career role.",
      );
    }

    if (!profile.githubUrl) {
      recommendations.push(
        "Add your GitHub profile.",
      );
    }

    if (!profile.linkedinUrl) {
      recommendations.push(
        "Add your LinkedIn profile.",
      );
    }

    if (!profile.resumeUrl) {
      recommendations.push(
        "Add your resume link.",
      );
    }
  }

  if (skills.length === 0) {
    recommendations.push(
      "Add your technical and professional skills.",
    );
  }

  if (projects.length === 0) {
    recommendations.push(
      "Add at least one practical project.",
    );
  }

  if (certifications.length === 0) {
    recommendations.push(
      "Add relevant certifications or learning achievements.",
    );
  }

  if (goals.length === 0) {
    recommendations.push(
      "Create a measurable career goal.",
    );
  }

  return {
    score: clamp(
      score,
      0,
      100,
    ),
    skillScore: clamp(
      skillScore,
      0,
      100,
    ),
    projectScore: clamp(
      projectScore,
      0,
      100,
    ),
    certificationScore: clamp(
      certificationScore,
      0,
      100,
    ),
    goalScore: clamp(
      goalScore,
      0,
      100,
    ),
    profileScore: clamp(
      profileScore,
      0,
      100,
    ),
    strengths: strengths.slice(
      0,
      5,
    ),
    gaps: [],
    recommendations:
      recommendations.slice(
        0,
        8,
      ),
  };
}

export async function getCareerData(): Promise<CareerData> {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
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
    return {
      profile: null,
      skills: [],
      projects: [],
      certifications: [],
      goals: [],
      recommendations: [],
      readiness: calculateBasicReadiness(
        null,
        [],
        [],
        [],
        [],
      ),
    };
  }

  const studentId =
    student.id;

  const [
    profileResult,
    skillsResult,
    studentSkillsResult,
    projectsResult,
    certificationsResult,
    goalsResult,
    recommendationsResult,
  ] = await Promise.all([
    supabase
      .from("career_profiles")
      .select(
        "id, student_id, target_role, target_industry, target_company_type, career_summary, github_url, linkedin_url, portfolio_url, resume_url, availability_status",
      )
      .eq(
        "student_id",
        studentId,
      )
      .maybeSingle(),

    supabase
      .from("career_skills")
      .select(
        "id, name, category, description, is_technical",
      )
      .order(
        "category",
        {
          ascending: true,
        },
      )
      .order(
        "name",
        {
          ascending: true,
        },
      ),

    supabase
      .from("student_career_skills")
      .select(
        "id, skill_id, proficiency_level, years_experience, evidence",
      )
      .eq(
        "student_id",
        studentId,
      ),

    supabase
      .from("career_projects")
      .select(
        "id, title, description, project_type, status, github_url, live_url, started_at, completed_at, featured",
      )
      .eq(
        "student_id",
        studentId,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      ),

    supabase
      .from("career_certifications")
      .select(
        "id, name, issuing_organization, credential_id, credential_url, issue_date, expiry_date, does_not_expire",
      )
      .eq(
        "student_id",
        studentId,
      )
      .order(
        "issue_date",
        {
          ascending: false,
        },
      ),

    supabase
      .from("career_goals")
      .select(
        "id, title, description, goal_type, target_date, status, progress",
      )
      .eq(
        "student_id",
        studentId,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      ),

    supabase
      .from(
        "career_learning_recommendations",
      )
      .select(
        "id, skill_id, title, description, resource_url, priority, estimated_hours, status, source",
      )
      .eq(
        "student_id",
        studentId,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
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

  if (studentSkillsResult.error) {
    throw new Error(
      studentSkillsResult.error.message,
    );
  }

  if (projectsResult.error) {
    throw new Error(
      projectsResult.error.message,
    );
  }

  if (certificationsResult.error) {
    throw new Error(
      certificationsResult.error.message,
    );
  }

  if (goalsResult.error) {
    throw new Error(
      goalsResult.error.message,
    );
  }

  if (recommendationsResult.error) {
    throw new Error(
      recommendationsResult.error.message,
    );
  }

  const rawProfile =
    (profileResult.data ??
      null) as RawCareerProfile | null;

  const rawSkills =
    (skillsResult.data ??
      []) as RawCareerSkill[];

  const rawStudentSkills =
    (studentSkillsResult.data ??
      []) as RawStudentCareerSkill[];

  const rawProjects =
    (projectsResult.data ??
      []) as RawCareerProject[];

  const rawCertifications =
    (certificationsResult.data ??
      []) as RawCareerCertification[];

  const rawGoals =
    (goalsResult.data ??
      []) as RawCareerGoal[];

  const rawRecommendations =
    (recommendationsResult.data ??
      []) as RawCareerRecommendation[];

  const skillMap =
    new Map<string, RawCareerSkill>();

  for (const skill of rawSkills) {
    skillMap.set(
      skill.id,
      skill,
    );
  }

  const skills: StudentCareerSkill[] =
    rawStudentSkills.map(
      (studentSkill) => {
        const catalogSkill =
          skillMap.get(
            studentSkill.skill_id,
          );

        return {
          id: studentSkill.id,
          skillId:
            studentSkill.skill_id,
          name:
            catalogSkill?.name ??
            "Unknown skill",
          category:
            catalogSkill?.category ??
            "Other",
          proficiencyLevel:
            clamp(
              Number(
                studentSkill.proficiency_level ??
                  1,
              ),
              1,
              5,
            ),
          yearsExperience:
            studentSkill.years_experience ??
            null,
          evidence:
            studentSkill.evidence ??
            null,
        };
      },
    );

  const profile: CareerProfile | null =
    rawProfile
      ? {
          id: rawProfile.id,
          studentId:
            rawProfile.student_id,
          targetRole:
            rawProfile.target_role,
          targetIndustry:
            rawProfile.target_industry,
          targetCompanyType:
            rawProfile.target_company_type,
          careerSummary:
            rawProfile.career_summary,
          githubUrl:
            rawProfile.github_url,
          linkedinUrl:
            rawProfile.linkedin_url,
          portfolioUrl:
            rawProfile.portfolio_url,
          resumeUrl:
            rawProfile.resume_url,
          availabilityStatus:
            normalizeAvailabilityStatus(
              rawProfile.availability_status,
            ),
        }
      : null;

  const projects: CareerProject[] =
    rawProjects.map(
      (project) => ({
        id: project.id,
        title: project.title,
        description:
          project.description,
        projectType:
          project.project_type,
        status:
          normalizeProjectStatus(
            project.status,
          ),
        githubUrl:
          project.github_url,
        liveUrl:
          project.live_url,
        startedAt:
          project.started_at,
        completedAt:
          project.completed_at,
        featured:
          Boolean(project.featured),
        skills: [],
      }),
    );

  /*
   * Project-skill relations are loaded separately.
   * This avoids Supabase nested-relation TypeScript
   * inference problems.
   */
  if (projects.length > 0) {
    const projectIds =
      projects.map(
        (project) => project.id,
      );

    const {
      data: projectSkillRows,
      error:
        projectSkillsError,
    } = await supabase
      .from(
        "career_project_skills",
      )
      .select(
        "project_id, skill_id",
      )
      .in(
        "project_id",
        projectIds,
      );

    if (projectSkillsError) {
      throw new Error(
        projectSkillsError.message,
      );
    }

    const rawProjectSkills =
      (projectSkillRows ??
        []) as RawProjectSkill[];

    const projectSkillsMap =
      new Map<
        string,
        string[]
      >();

    for (const relation of rawProjectSkills) {
      const skill =
        skillMap.get(
          relation.skill_id,
        );

      if (!skill) {
        continue;
      }

      const existing =
        projectSkillsMap.get(
          relation.project_id,
        ) ?? [];

      existing.push(
        skill.name,
      );

      projectSkillsMap.set(
        relation.project_id,
        existing,
      );
    }

    for (const project of projects) {
      project.skills =
        projectSkillsMap.get(
          project.id,
        ) ?? [];
    }
  }

  const certifications: CareerCertification[] =
    rawCertifications.map(
      (certification) => ({
        id: certification.id,
        name: certification.name,
        issuingOrganization:
          certification.issuing_organization,
        credentialId:
          certification.credential_id,
        credentialUrl:
          certification.credential_url,
        issueDate:
          certification.issue_date,
        expiryDate:
          certification.expiry_date,
        doesNotExpire:
          Boolean(
            certification.does_not_expire,
          ),
      }),
    );

  const goals: CareerGoal[] =
    rawGoals.map(
      (goal) => ({
        id: goal.id,
        title: goal.title,
        description:
          goal.description,
        goalType:
          normalizeGoalType(
            goal.goal_type,
          ),
        targetDate:
          goal.target_date,
        status:
          normalizeGoalStatus(
            goal.status,
          ),
        progress: clamp(
          Number(
            goal.progress ?? 0,
          ),
          0,
          100,
        ),
      }),
    );

  const recommendations: CareerRecommendation[] =
    rawRecommendations.map(
      (recommendation) => {
        const skill =
          recommendation.skill_id
            ? skillMap.get(
                recommendation.skill_id,
              )
            : undefined;

        return {
          id:
            recommendation.id,
          skillId:
            recommendation.skill_id,
          skillName:
            skill?.name ?? null,
          title:
            recommendation.title,
          description:
            recommendation.description,
          resourceUrl:
            recommendation.resource_url,
          priority:
            normalizeRecommendationPriority(
              recommendation.priority,
            ),
          estimatedHours:
            recommendation.estimated_hours,
          status:
            normalizeRecommendationStatus(
              recommendation.status,
            ),
          source:
            normalizeRecommendationSource(
              recommendation.source,
            ),
        };
      },
    );

  const readiness =
    calculateBasicReadiness(
      profile,
      skills,
      projects,
      certifications,
      goals,
    );

  return {
    profile,
    skills,
    projects,
    certifications,
    goals,
    recommendations,
    readiness,
  };
}