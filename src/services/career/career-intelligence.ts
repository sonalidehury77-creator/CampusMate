import type {
  CareerReadiness,
  CareerProfile,
  CareerProject,
  CareerCertification,
  CareerGoal,
  SkillGap,
  StudentCareerSkill,
} from "@/types/career";

type SkillTarget = {
  skillId: string;
  skillName: string;
  category: string;
  targetLevel: number;
};

function clamp(
  value: number,
  min = 0,
  max = 100,
) {
  return Math.min(
    max,
    Math.max(min, value),
  );
}

function calculateSkillScore(
  skills: StudentCareerSkill[],
) {
  if (skills.length === 0) {
    return 0;
  }

  const total = skills.reduce(
    (sum, skill) =>
      sum + skill.proficiencyLevel,
    0,
  );

  return Math.round(
    (total /
      (skills.length * 5)) *
      100,
  );
}

function calculateProjectScore(
  projects: CareerProject[],
) {
  if (projects.length === 0) {
    return 0;
  }

  const completed = projects.filter(
    (project) =>
      project.status === "completed",
  ).length;

  const inProgress = projects.filter(
    (project) =>
      project.status === "in_progress",
  ).length;

  return Math.round(
    clamp(
      completed * 25 +
        inProgress * 10,
    ),
  );
}

function calculateCertificationScore(
  certifications: CareerCertification[],
) {
  if (certifications.length === 0) {
    return 0;
  }

  return Math.min(
    100,
    certifications.length * 25,
  );
}

function calculateGoalScore(
  goals: CareerGoal[],
) {
  const activeGoals =
    goals.filter(
      (goal) =>
        goal.status === "active",
    );

  if (activeGoals.length === 0) {
    return 0;
  }

  const average =
    activeGoals.reduce(
      (sum, goal) =>
        sum + goal.progress,
      0,
    ) / activeGoals.length;

  return Math.round(
    average,
  );
}

function calculateProfileScore(
  profile: CareerProfile | null,
) {
  if (!profile) {
    return 0;
  }

  const fields = [
    profile.targetRole,
    profile.targetIndustry,
    profile.careerSummary,
    profile.githubUrl,
    profile.linkedinUrl,
    profile.portfolioUrl,
    profile.resumeUrl,
  ];

  const completed =
    fields.filter(Boolean).length;

  return Math.round(
    (completed /
      fields.length) *
      100,
  );
}

export function calculateCareerReadiness(
  profile: CareerProfile | null,
  skills: StudentCareerSkill[],
  projects: CareerProject[],
  certifications: CareerCertification[],
  goals: CareerGoal[],
  targets: SkillTarget[] = [],
): CareerReadiness {
  const skillScore =
    calculateSkillScore(skills);

  const projectScore =
    calculateProjectScore(projects);

  const certificationScore =
    calculateCertificationScore(
      certifications,
    );

  const goalScore =
    calculateGoalScore(goals);

  const profileScore =
    calculateProfileScore(profile);

  const gaps: SkillGap[] =
    targets
      .map((target) => {
        const studentSkill =
          skills.find(
            (skill) =>
              skill.skillId ===
              target.skillId,
          );

        const currentLevel =
          studentSkill?.proficiencyLevel ??
          0;

        const gap = Math.max(
          0,
          target.targetLevel -
            currentLevel,
        );

        let priority:
          | "low"
          | "medium"
          | "high" =
          "low";

        if (gap >= 3) {
          priority = "high";
        } else if (gap >= 2) {
          priority = "medium";
        }

        return {
          skillId:
            target.skillId,
          skillName:
            target.skillName,
          category:
            target.category,
          currentLevel,
          targetLevel:
            target.targetLevel,
          gap,
          priority,
        };
      })
      .filter(
        (gap) => gap.gap > 0,
      )
      .sort(
        (a, b) =>
          b.gap - a.gap,
      );

  const score = Math.round(
    skillScore * 0.35 +
      projectScore * 0.25 +
      certificationScore * 0.10 +
      goalScore * 0.15 +
      profileScore * 0.15,
  );

  const strengths: string[] = [];

  if (skillScore >= 70) {
    strengths.push(
      "Your recorded skill proficiency is strong.",
    );
  }

  if (projectScore >= 60) {
    strengths.push(
      "You have meaningful project experience.",
    );
  }

  if (certificationScore >= 50) {
    strengths.push(
      "Your certification portfolio is developing well.",
    );
  }

  if (profileScore >= 70) {
    strengths.push(
      "Your professional profile is well completed.",
    );
  }

  const recommendations: string[] = [];

  if (profileScore < 70) {
    recommendations.push(
      "Complete your professional profile and add portfolio links.",
    );
  }

  if (projectScore < 60) {
    recommendations.push(
      "Build and document more practical projects.",
    );
  }

  if (skillScore < 60) {
    recommendations.push(
      "Improve the proficiency of your core technical skills.",
    );
  }

  if (gaps.length > 0) {
    recommendations.push(
      `Prioritize ${gaps[0].skillName} because it currently has the largest skill gap.`,
    );
  }

  if (goals.length === 0) {
    recommendations.push(
      "Create a clear career goal so CampusMate can personalize your roadmap.",
    );
  }

  return {
    score,
    skillScore,
    projectScore,
    certificationScore,
    goalScore,
    profileScore,
    strengths,
    gaps,
    recommendations,
  };
}