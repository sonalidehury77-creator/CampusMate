export type HealthLevel =
  | "excellent"
  | "good"
  | "moderate"
  | "needs_attention"
  | "critical";

export type HealthMetric = {
  score: number;
  level: HealthLevel;
  label: string;
  description: string;
};

export type SubjectHealth = {
  subjectId: string;
  subjectCode: string;
  subjectName: string;

  overallScore: number;
  level: HealthLevel;

  attendance: HealthMetric;
  syllabus: HealthMetric;
  assignments: HealthMetric;
  study: HealthMetric;

  progress: number;

  pendingAssignments: number;
  overdueAssignments: number;

  attendancePercentage: number;

  recommendation: string;
};

export type AcademicRisk = {
  id: string;
  type:
    | "attendance"
    | "assignment"
    | "syllabus"
    | "exam"
    | "study";

  severity: "low" | "medium" | "high";

  title: string;
  description: string;
  action: string;

  subjectId?: string;
  subjectName?: string;
};

export type AcademicRecommendation = {
  id: string;

  priority: "high" | "medium" | "low";

  title: string;
  description: string;
  action: string;

  subjectId?: string;
  subjectName?: string;
};

export type AcademicTrendPoint = {
  label: string;
  score: number;
};

export type AcademicHealthData = {
  overallScore: number;
  overallLevel: HealthLevel;

  attendance: HealthMetric;
  assignments: HealthMetric;
  syllabus: HealthMetric;
  studyConsistency: HealthMetric;
  examReadiness: HealthMetric;

  subjects: SubjectHealth[];

  risks: AcademicRisk[];

  recommendations: AcademicRecommendation[];

  trend: AcademicTrendPoint[];

  summary: string;

  generatedAt: string;
};