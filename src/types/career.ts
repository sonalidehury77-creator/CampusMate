export type CareerProfile = {
  id: string;
  studentId: string;
  targetRole: string | null;
  targetIndustry: string | null;
  targetCompanyType: string | null;
  careerSummary: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  resumeUrl: string | null;
  availabilityStatus:
    | "open_to_opportunities"
    | "actively_looking"
    | "not_looking"
    | "open_to_internships";
};

export type CareerSkill = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  isTechnical: boolean;
};

export type StudentCareerSkill = {
  id: string;
  skillId: string;
  name: string;
  category: string;
  proficiencyLevel: number;
  yearsExperience: number | null;
  evidence: string | null;
};

export type CareerProject = {
  id: string;
  title: string;
  description: string | null;
  projectType: string | null;
  status:
    | "idea"
    | "in_progress"
    | "completed";
  githubUrl: string | null;
  liveUrl: string | null;
  startedAt: string | null;
  completedAt: string | null;
  featured: boolean;
  skills: string[];
};

export type CareerCertification = {
  id: string;
  name: string;
  issuingOrganization: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  doesNotExpire: boolean;
};

export type CareerGoal = {
  id: string;
  title: string;
  description: string | null;
  goalType:
    | "job"
    | "internship"
    | "placement"
    | "higher_studies"
    | "freelancing"
    | "entrepreneurship"
    | "certification";
  targetDate: string | null;
  status:
    | "active"
    | "completed"
    | "paused"
    | "cancelled";
  progress: number;
};

export type CareerRecommendation = {
  id: string;
  skillId: string | null;
  skillName: string | null;
  title: string;
  description: string | null;
  resourceUrl: string | null;
  priority:
    | "low"
    | "normal"
    | "high"
    | "urgent";
  estimatedHours: number | null;
  status:
    | "recommended"
    | "in_progress"
    | "completed"
    | "dismissed";
  source:
    | "system"
    | "ai"
    | "manual";
};

export type SkillGap = {
  skillId: string;
  skillName: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: "low" | "medium" | "high";
};

export type CareerReadiness = {
  score: number;
  skillScore: number;
  projectScore: number;
  certificationScore: number;
  goalScore: number;
  profileScore: number;
  strengths: string[];
  gaps: SkillGap[];
  recommendations: string[];
};

export type CareerData = {
  profile: CareerProfile | null;
  skills: StudentCareerSkill[];
  projects: CareerProject[];
  certifications: CareerCertification[];
  goals: CareerGoal[];
  recommendations: CareerRecommendation[];
  readiness: CareerReadiness;
};