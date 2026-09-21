export type AnalyticsTrend =
  | "improving"
  | "stable"
  | "declining"
  | "insufficient_data";

export type AcademicRiskLevel =
  | "low"
  | "moderate"
  | "high"
  | "critical";

export type AnalyticsMetric = {
  current: number;
  previous: number | null;
  change: number | null;
  trend: AnalyticsTrend;
};

export type AttendanceAnalytics = {
  overall: number;
  attended: number;
  total: number;
  metric: AnalyticsMetric;
  monthlyTrend: Array<{
    month: string;
    percentage: number;
  }>;
};

export type AssignmentAnalytics = {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  metric: AnalyticsMetric;
};

export type StudyAnalytics = {
  totalMinutes: number;
  averageDailyMinutes: number;
  activeDays: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  metric: AnalyticsMetric;
};

export type SubjectAnalytics = {
  subjectId: string;
  subjectCode: string;
  subjectName: string;

  attendance: number | null;

  assignmentCompletion: number | null;

  studyMinutes: number;

  syllabusProgress: number | null;

  examReadiness: number | null;

  performanceScore: number;

  trend: AnalyticsTrend;

  riskLevel: AcademicRiskLevel;
};

export type ExamAnalytics = {
  totalExams: number;
  upcomingExams: number;
  completedExams: number;

  averageDaysToExam: number | null;

  preparationScore: number;

  exams: Array<{
    id: string;
    subjectId: string;
    subjectName: string;
    examType: string;
    examDate: string;
    preparationScore: number;
  }>;
};

export type AcademicRisk = {
  key: string;
  level: AcademicRiskLevel;
  title: string;
  description: string;
  metric: number | null;
  recommendedAction: string;
};

export type AcademicInsight = {
  type:
    | "positive"
    | "warning"
    | "action"
    | "info";

  title: string;
  description: string;

  href?: string;
};

export type AcademicAnalyticsData = {
  generatedAt: string;

  overallScore: number;

  overallTrend: AnalyticsTrend;

  attendance: AttendanceAnalytics;

  assignments: AssignmentAnalytics;

  study: StudyAnalytics;

  subjects: SubjectAnalytics[];

  exams: ExamAnalytics;

  risks: AcademicRisk[];

  insights: AcademicInsight[];

  strongestSubjects: SubjectAnalytics[];

  weakestSubjects: SubjectAnalytics[];
};