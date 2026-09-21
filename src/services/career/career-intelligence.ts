import { getCareerData } from "@/services/career/career-data";

import type {
  CareerData,
  CareerReadiness,
  SkillGap,
} from "@/types/career";

type RoleSkillRequirement = {
  name: string;
  category: string;
  targetLevel: number;
  priority: "low" | "medium" | "high";
};

type CareerRoleProfile = {
  role: string;
  description: string;
  skills: RoleSkillRequirement[];
};

export type CareerIntelligence = {
  data: CareerData;
  roleProfile: CareerRoleProfile | null;
  readiness: CareerReadiness;
  skillGaps: SkillGap[];
  strengths: string[];
  recommendedActions: string[];
  roleMatchScore: number;
};

const ROLE_PROFILES: CareerRoleProfile[] = [
  {
    role: "Software Developer",
    description:
      "Build software applications, APIs and production-ready systems.",
    skills: [
      {
        name: "Java",
        category: "Programming",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "JavaScript",
        category: "Programming",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "TypeScript",
        category: "Programming",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "Git",
        category: "Developer Tools",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "SQL",
        category: "Database",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "React",
        category: "Frontend",
        targetLevel: 3,
        priority: "medium",
      },
      {
        name: "Problem Solving",
        category: "Core Skills",
        targetLevel: 4,
        priority: "high",
      },
    ],
  },

  {
    role: "Frontend Developer",
    description:
      "Build responsive, accessible and interactive web interfaces.",
    skills: [
      {
        name: "HTML",
        category: "Frontend",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "CSS",
        category: "Frontend",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "JavaScript",
        category: "Programming",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "TypeScript",
        category: "Programming",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "React",
        category: "Frontend",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "Git",
        category: "Developer Tools",
        targetLevel: 3,
        priority: "medium",
      },
      {
        name: "UI/UX",
        category: "Design",
        targetLevel: 3,
        priority: "medium",
      },
    ],
  },

  {
    role: "Backend Developer",
    description:
      "Build APIs, databases, authentication systems and backend services.",
    skills: [
      {
        name: "Java",
        category: "Programming",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "Python",
        category: "Programming",
        targetLevel: 3,
        priority: "medium",
      },
      {
        name: "SQL",
        category: "Database",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "REST API",
        category: "Backend",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "Git",
        category: "Developer Tools",
        targetLevel: 3,
        priority: "medium",
      },
      {
        name: "Database Design",
        category: "Database",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "Problem Solving",
        category: "Core Skills",
        targetLevel: 4,
        priority: "high",
      },
    ],
  },

  {
    role: "Full Stack Developer",
    description:
      "Develop complete applications across frontend, backend and databases.",
    skills: [
      {
        name: "JavaScript",
        category: "Programming",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "TypeScript",
        category: "Programming",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "React",
        category: "Frontend",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "SQL",
        category: "Database",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "Git",
        category: "Developer Tools",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "REST API",
        category: "Backend",
        targetLevel: 3,
        priority: "medium",
      },
      {
        name: "Database Design",
        category: "Database",
        targetLevel: 3,
        priority: "medium",
      },
    ],
  },

  {
    role: "Data Analyst",
    description:
      "Use data, statistics and visualization to generate useful insights.",
    skills: [
      {
        name: "Python",
        category: "Programming",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "SQL",
        category: "Database",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "Statistics",
        category: "Data",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "Data Visualization",
        category: "Data",
        targetLevel: 3,
        priority: "medium",
      },
      {
        name: "Excel",
        category: "Data",
        targetLevel: 3,
        priority: "medium",
      },
      {
        name: "Problem Solving",
        category: "Core Skills",
        targetLevel: 3,
        priority: "medium",
      },
    ],
  },

  {
    role: "AI Engineer",
    description:
      "Build intelligent applications using AI, machine learning and data.",
    skills: [
      {
        name: "Python",
        category: "Programming",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "Machine Learning",
        category: "AI",
        targetLevel: 4,
        priority: "high",
      },
      {
        name: "Statistics",
        category: "Data",
        targetLevel: 3,
        priority: "medium",
      },
      {
        name: "SQL",
        category: "Database",
        targetLevel: 3,
        priority: "medium",
      },
      {
        name: "Git",
        category: "Developer Tools",
        targetLevel: 3,
        priority: "medium",
      },
      {
        name: "Problem Solving",
        category: "Core Skills",
        targetLevel: 4,
        priority: "high",
      },
    ],
  },
];

function normalize(
  value: string | null | undefined,
): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(
      /[-_]+/g,
      " ",
    );
}

function resolveRole(
  targetRole: string | null,
): CareerRoleProfile | null {
  const value =
    normalize(targetRole);

  if (!value) {
    return null;
  }

  const aliases: Record<
    string,
    string
  > = {
    "software engineer":
      "software developer",
    "software development":
      "software developer",
    developer:
      "software developer",
    "web developer":
      "frontend developer",
    "frontend engineer":
      "frontend developer",
    "backend engineer":
      "backend developer",
    "fullstack developer":
      "full stack developer",
    "full stack engineer":
      "full stack developer",
    "full-stack developer":
      "full stack developer",
    "data scientist":
      "data analyst",
    "machine learning engineer":
      "ai engineer",
  };

  const resolved =
    aliases[value] ?? value;

  return (
    ROLE_PROFILES.find(
      (role) =>
        normalize(role.role) ===
        resolved,
    ) ?? null
  );
}

function calculateSkillGaps(
  data: CareerData,
  role: CareerRoleProfile | null,
): SkillGap[] {
  if (!role) {
    return [];
  }

  const gaps: SkillGap[] = [];

  for (const requirement of role.skills) {
    const studentSkill =
      data.skills.find(
        (skill) =>
          normalize(skill.name) ===
          normalize(
            requirement.name,
          ),
      );

    const currentLevel =
      studentSkill?.proficiencyLevel ??
      0;

    const gap =
      Math.max(
        requirement.targetLevel -
          currentLevel,
        0,
      );

    if (gap > 0) {
      gaps.push({
        skillId:
          studentSkill?.skillId ??
          `missing-${normalize(
            requirement.name,
          ).replace(
            /\s+/g,
            "-",
          )}`,
        skillName:
          requirement.name,
        category:
          requirement.category,
        currentLevel,
        targetLevel:
          requirement.targetLevel,
        gap,
        priority:
          requirement.priority,
      });
    }
  }

  const priorityOrder: Record<
    SkillGap["priority"],
    number
  > = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return gaps.sort(
    (a, b) => {
      const priorityDifference =
        priorityOrder[a.priority] -
        priorityOrder[b.priority];

      if (
        priorityDifference !== 0
      ) {
        return priorityDifference;
      }

      return b.gap - a.gap;
    },
  );
}

function calculateRoleMatch(
  data: CareerData,
  role: CareerRoleProfile | null,
): number {
  if (!role) {
    return 0;
  }

  let achieved = 0;
  let possible = 0;

  for (const requirement of role.skills) {
    const skill =
      data.skills.find(
        (studentSkill) =>
          normalize(
            studentSkill.name,
          ) ===
          normalize(
            requirement.name,
          ),
      );

    const current =
      skill?.proficiencyLevel ?? 0;

    achieved += Math.min(
      current,
      requirement.targetLevel,
    );

    possible +=
      requirement.targetLevel;
  }

  if (possible === 0) {
    return 0;
  }

  return Math.round(
    (achieved / possible) *
      100,
  );
}

function buildStrengths(
  data: CareerData,
  role: CareerRoleProfile | null,
): string[] {
  const strengths: string[] = [];

  const strongSkills =
    data.skills
      .filter(
        (skill) =>
          skill.proficiencyLevel >=
          4,
      )
      .sort(
        (a, b) =>
          b.proficiencyLevel -
          a.proficiencyLevel,
      )
      .slice(0, 3);

  for (const skill of strongSkills) {
    strengths.push(
      `${skill.name} is recorded at ${skill.proficiencyLevel}/5 proficiency.`,
    );
  }

  const completedProjects =
    data.projects.filter(
      (project) =>
        project.status ===
        "completed",
    ).length;

  if (completedProjects > 0) {
    strengths.push(
      `You have ${completedProjects} completed practical project${
        completedProjects === 1
          ? ""
          : "s"
      }.`,
    );
  }

  const linkedProjects =
    data.projects.filter(
      (project) =>
        Boolean(
          project.githubUrl,
        ) ||
        Boolean(
          project.liveUrl,
        ),
    ).length;

  if (linkedProjects > 0) {
    strengths.push(
      `${linkedProjects} project${
        linkedProjects === 1
          ? ""
          : "s"
      } include public project links.`,
    );
  }

  if (
    data.certifications.length >
    0
  ) {
    strengths.push(
      `You have ${data.certifications.length} recorded certification${
        data.certifications
          .length === 1
          ? ""
          : "s"
      }.`,
    );
  }

  if (
    data.goals.some(
      (goal) =>
        goal.status === "active",
    )
  ) {
    strengths.push(
      "You have active career goals.",
    );
  }

  if (role) {
    const matchingStrongSkill =
      data.skills.some(
        (skill) =>
          skill.proficiencyLevel >=
            4 &&
          role.skills.some(
            (required) =>
              normalize(
                required.name,
              ) ===
              normalize(
                skill.name,
              ),
          ),
      );

    if (
      matchingStrongSkill
    ) {
      strengths.push(
        `Some of your stronger skills already match the requirements for ${role.role}.`,
      );
    }
  }

  return strengths.slice(
    0,
    6,
  );
}

function buildRecommendations(
  data: CareerData,
  role: CareerRoleProfile | null,
  gaps: SkillGap[],
): string[] {
  const recommendations: string[] =
    [];

  if (!data.profile) {
    recommendations.push(
      "Complete your Career Profile.",
    );
  } else {
    if (
      !data.profile.targetRole
    ) {
      recommendations.push(
        "Set a target role to unlock role-specific skill analysis.",
      );
    }

    if (
      !data.profile.githubUrl
    ) {
      recommendations.push(
        "Add your GitHub profile.",
      );
    }

    if (
      !data.profile.linkedinUrl
    ) {
      recommendations.push(
        "Add your LinkedIn profile.",
      );
    }

    if (
      !data.profile.resumeUrl
    ) {
      recommendations.push(
        "Add your resume link.",
      );
    }
  }

  if (
    gaps.length > 0
  ) {
    const topGap =
      gaps[0];

    recommendations.push(
      `Develop ${topGap.skillName} from ${topGap.currentLevel}/5 toward ${topGap.targetLevel}/5.`,
    );
  }

  if (
    data.projects.length ===
    0
  ) {
    recommendations.push(
      "Add a practical project related to your target role.",
    );
  } else if (
    !data.projects.some(
      (project) =>
        project.status ===
        "completed",
    )
  ) {
    recommendations.push(
      "Complete at least one project and document its result.",
    );
  }

  if (
    data.certifications.length ===
    0
  ) {
    recommendations.push(
      "Add relevant certifications or verified learning achievements.",
    );
  }

  if (
    data.goals.length === 0
  ) {
    recommendations.push(
      "Create a measurable career goal.",
    );
  }

  if (
    role === null &&
    data.profile?.targetRole
  ) {
    recommendations.push(
      "Your target role is not yet in the built-in role catalog.",
    );
  }

  return recommendations.slice(
    0,
    8,
  );
}

function buildReadiness(
  data: CareerData,
  gaps: SkillGap[],
): CareerReadiness {
  const base =
    data.readiness;

  const gapPenalty =
    gaps.length > 0
      ? Math.min(
          gaps.length * 2,
          15,
        )
      : 0;

  return {
    ...base,
    score: Math.max(
      0,
      Math.min(
        100,
        base.score -
          gapPenalty,
      ),
    ),
    gaps,
  };
}

export async function getCareerIntelligence(): Promise<CareerIntelligence> {
  const data =
    await getCareerData();

  const roleProfile =
    resolveRole(
      data.profile?.targetRole ??
        null,
    );

  const skillGaps =
    calculateSkillGaps(
      data,
      roleProfile,
    );

  const roleMatchScore =
    calculateRoleMatch(
      data,
      roleProfile,
    );

  const strengths =
    buildStrengths(
      data,
      roleProfile,
    );

  const recommendedActions =
    buildRecommendations(
      data,
      roleProfile,
      skillGaps,
    );

  const readiness =
    buildReadiness(
      data,
      skillGaps,
    );

  return {
    data,
    roleProfile,
    readiness,
    skillGaps,
    strengths,
    recommendedActions,
    roleMatchScore,
  };
}