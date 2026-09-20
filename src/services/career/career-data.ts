import { createClient } from "@/lib/supabase/server";

import { calculateCareerReadiness } from "@/services/career/career-intelligence";

import type {
  CareerCertification,
  CareerData,
  CareerGoal,
  CareerProfile,
  CareerProject,
  CareerRecommendation,
  StudentCareerSkill,
} from "@/types/career";

/* =========================================================
   CAREER PROFILE NORMALIZERS
   ========================================================= */

function normalizeAvailabilityStatus(
  value: string | null,
):
  | "open_to_opportunities"
  | "actively_looking"
  | "not_looking"
  | "open_to_internships" {
  switch (value) {
    case "open_to_opportunities":
      return "open_to_opportunities";

    case "actively_looking":
      return "actively_looking";

    case "not_looking":
      return "not_looking";

    case "open_to_internships":
      return "open_to_internships";

    default:
      return "open_to_opportunities";
  }
}

/* =========================================================
   PROJECT STATUS NORMALIZER
   ========================================================= */

function normalizeProjectStatus(
  value: string | null,
): "completed" | "in_progress" | "idea" {
  switch (value) {
    case "completed":
      return "completed";

    case "in_progress":
      return "in_progress";

    case "idea":
      return "idea";

    default:
      return "idea";
  }
}

/* =========================================================
   CAREER GOAL TYPE NORMALIZER
   ========================================================= */

function normalizeGoalType(
  value: string | null,
):
  | "job"
  | "internship"
  | "placement"
  | "higher_studies"
  | "freelancing"
  | "entrepreneurship"
  | "certification" {
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

/* =========================================================
   CAREER GOAL STATUS NORMALIZER
   ========================================================= */

function normalizeGoalStatus(
  value: string | null,
): "completed" | "active" | "paused" | "cancelled" {
  switch (value) {
    case "completed":
      return "completed";

    case "active":
      return "active";

    case "paused":
      return "paused";

    case "cancelled":
      return "cancelled";

    default:
      return "active";
  }
}

/* =========================================================
   RECOMMENDATION PRIORITY NORMALIZER
   ========================================================= */

function normalizeRecommendationPriority(
  value: string | null,
): "low" | "high" | "urgent" | "normal" {
  switch (value) {
    case "low":
      return "low";

    case "high":
      return "high";

    case "urgent":
      return "urgent";

    case "normal":
      return "normal";

    default:
      return "normal";
  }
}

/* =========================================================
   RECOMMENDATION STATUS NORMALIZER
   ========================================================= */

function normalizeRecommendationStatus(
  value: string | null,
): "completed" | "in_progress" | "dismissed" | "recommended" {
  switch (value) {
    case "completed":
      return "completed";

    case "in_progress":
      return "in_progress";

    case "dismissed":
      return "dismissed";

    case "recommended":
      return "recommended";

    default:
      return "recommended";
  }
}

/* =========================================================
   RECOMMENDATION SOURCE NORMALIZER
   ========================================================= */

function normalizeRecommendationSource(
  value: string | null,
): "system" | "ai" | "manual" {
  switch (value) {
    case "system":
      return "system";

    case "ai":
      return "ai";

    case "manual":
      return "manual";

    default:
      return "system";
  }
}

/* =========================================================
   MAIN CAREER DATA LOADER
   ========================================================= */

export async function getCareerData(): Promise<CareerData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  /* =======================================================
     LOAD STUDENT
     ======================================================= */

  const { data: student, error: studentError } = await supabase
  .from("students")
  .select("id, profile_id")
  .eq("profile_id", user.id)
  .maybeSingle();

if (studentError) {
  throw new Error(studentError.message);
}

if (!student) {
  throw new Error("Student profile was not found.");
}

const studentId = student.id;

  /* =======================================================
     LOAD ALL CAREER DATA
     ======================================================= */

  const [
    profileResult,
    skillsResult,
    projectsResult,
    certificationsResult,
    goalsResult,
    recommendationsResult,
  ] = await Promise.all([
    /* -------------------------------------------------------
       CAREER PROFILE
       ------------------------------------------------------- */

    supabase
      .from("career_profiles")
      .select(
        `
        id,
        student_id,
        target_role,
        target_industry,
        target_company_type,
        career_summary,
        github_url,
        linkedin_url,
        portfolio_url,
        resume_url,
        availability_status
      `,
      )
      .eq("student_id", studentId)
      .maybeSingle(),

    /* -------------------------------------------------------
       STUDENT CAREER SKILLS
       ------------------------------------------------------- */

    supabase
      .from("student_career_skills")
      .select(
        `
        id,
        skill_id,
        proficiency_level,
        years_experience,
        evidence,
        career_skills (
          name,
          category
        )
      `,
      )
      .eq("student_id", studentId),

    /* -------------------------------------------------------
       CAREER PROJECTS
       ------------------------------------------------------- */

    supabase
      .from("career_projects")
      .select(
        `
        id,
        title,
        description,
        project_type,
        status,
        github_url,
        live_url,
        started_at,
        completed_at,
        featured,
        career_project_skills (
          career_skills (
            name
          )
        )
      `,
      )
      .eq("student_id", studentId)
      .order("featured", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      }),

    /* -------------------------------------------------------
       CERTIFICATIONS
       ------------------------------------------------------- */

    supabase
      .from("career_certifications")
      .select(
        `
        id,
        name,
        issuing_organization,
        credential_id,
        credential_url,
        issue_date,
        expiry_date,
        does_not_expire
      `,
      )
      .eq("student_id", studentId)
      .order("issue_date", {
        ascending: false,
      }),

    /* -------------------------------------------------------
       CAREER GOALS
       ------------------------------------------------------- */

    supabase
      .from("career_goals")
      .select(
        `
        id,
        title,
        description,
        goal_type,
        target_date,
        status,
        progress
      `,
      )
      .eq("student_id", studentId)
      .order("created_at", {
        ascending: false,
      }),

    /* -------------------------------------------------------
       LEARNING RECOMMENDATIONS
       ------------------------------------------------------- */

    supabase
      .from("career_learning_recommendations")
      .select(
        `
        id,
        skill_id,
        title,
        description,
        resource_url,
        priority,
        estimated_hours,
        status,
        source,
        career_skills (
          name
        )
      `,
      )
      .eq("student_id", studentId)
      .neq("status", "dismissed")
      .order("priority", {
        ascending: true,
      })
      .limit(20),
  ]);

  /* =======================================================
     ERROR HANDLING
     ======================================================= */

  if (profileResult.error) {
    throw new Error(
      `Failed to load career profile: ${profileResult.error.message}`,
    );
  }

  if (skillsResult.error) {
    throw new Error(
      `Failed to load career skills: ${skillsResult.error.message}`,
    );
  }

  if (projectsResult.error) {
    throw new Error(
      `Failed to load career projects: ${projectsResult.error.message}`,
    );
  }

  if (certificationsResult.error) {
    throw new Error(
      `Failed to load certifications: ${certificationsResult.error.message}`,
    );
  }

  if (goalsResult.error) {
    throw new Error(
      `Failed to load career goals: ${goalsResult.error.message}`,
    );
  }

  if (recommendationsResult.error) {
    throw new Error(
      `Failed to load recommendations: ${recommendationsResult.error.message}`,
    );
  }

  /* =======================================================
     CAREER PROFILE
     ======================================================= */

  const profileRow = profileResult.data;

  const profile: CareerProfile | null = profileRow
    ? {
        id: profileRow.id,

        studentId:
          profileRow.student_id,

        targetRole:
          profileRow.target_role,

        targetIndustry:
          profileRow.target_industry,

        targetCompanyType:
          profileRow.target_company_type,

        careerSummary:
          profileRow.career_summary,

        githubUrl:
          profileRow.github_url,

        linkedinUrl:
          profileRow.linkedin_url,

        portfolioUrl:
          profileRow.portfolio_url,

        resumeUrl:
          profileRow.resume_url,

        availabilityStatus:
          normalizeAvailabilityStatus(
            profileRow.availability_status,
          ),
      }
    : null;

  /* =======================================================
     STUDENT CAREER SKILLS
     ======================================================= */

  const skills: StudentCareerSkill[] = (
    skillsResult.data ?? []
  ).map((row) => {
    const skill = Array.isArray(
      row.career_skills,
    )
      ? row.career_skills[0]
      : row.career_skills;

    return {
      id: row.id,

      skillId:
        row.skill_id,

      name:
        skill?.name ??
        "Unknown skill",

      category:
        skill?.category ??
        "Other",

      proficiencyLevel:
        row.proficiency_level,

      yearsExperience:
        row.years_experience,

      evidence:
        row.evidence,
    };
  });

  /* =======================================================
     CAREER PROJECTS
     ======================================================= */

  const projects: CareerProject[] = (
    projectsResult.data ?? []
  ).map((row) => {
    const projectSkills = (
      row.career_project_skills ?? []
    )
      .map((item) => {
        const skill =
          Array.isArray(
            item.career_skills,
          )
            ? item.career_skills[0]
            : item.career_skills;

        return skill?.name ?? "";
      })
      .filter(Boolean);

    return {
      id: row.id,

      title:
        row.title,

      description:
        row.description,

      projectType:
        row.project_type,

      status:
        normalizeProjectStatus(
          row.status,
        ),

      githubUrl:
        row.github_url,

      liveUrl:
        row.live_url,

      startedAt:
        row.started_at,

      completedAt:
        row.completed_at,

      featured:
        row.featured,

      skills:
        projectSkills,
    };
  });

  /* =======================================================
     CERTIFICATIONS
     ======================================================= */

  const certifications: CareerCertification[] = (
    certificationsResult.data ?? []
  ).map((row) => ({
    id: row.id,

    name:
      row.name,

    issuingOrganization:
      row.issuing_organization,

    credentialId:
      row.credential_id,

    credentialUrl:
      row.credential_url,

    issueDate:
      row.issue_date,

    expiryDate:
      row.expiry_date,

    doesNotExpire:
      row.does_not_expire,
  }));

  /* =======================================================
     CAREER GOALS
     ======================================================= */

  const goals: CareerGoal[] = (
    goalsResult.data ?? []
  ).map((row) => ({
    id: row.id,

    title:
      row.title,

    description:
      row.description,

    goalType:
      normalizeGoalType(
        row.goal_type,
      ),

    targetDate:
      row.target_date,

    status:
      normalizeGoalStatus(
        row.status,
      ),

    progress:
      row.progress,
  }));

  /* =======================================================
     CAREER RECOMMENDATIONS
     ======================================================= */

  const recommendations: CareerRecommendation[] = (
    recommendationsResult.data ?? []
  ).map((row) => {
    const skill = Array.isArray(
      row.career_skills,
    )
      ? row.career_skills[0]
      : row.career_skills;

    return {
      id: row.id,

      skillId:
        row.skill_id,

      skillName:
        skill?.name ?? null,

      title:
        row.title,

      description:
        row.description,

      resourceUrl:
        row.resource_url,

      priority:
        normalizeRecommendationPriority(
          row.priority,
        ),

      estimatedHours:
        row.estimated_hours,

      status:
        normalizeRecommendationStatus(
          row.status,
        ),

      source:
        normalizeRecommendationSource(
          row.source,
        ),
    };
  });

  /* =======================================================
     CAREER READINESS
     ======================================================= */

  const readiness =
    calculateCareerReadiness(
      profile,
      skills,
      projects,
      certifications,
      goals,
    );

  /* =======================================================
     FINAL CAREER DATA
     ======================================================= */

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