export type ExamPreparationStatus =
  | "not_started"
  | "learning"
  | "revising"
  | "completed";

export type ExamRevisionItemStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "skipped";

export type ExamRevisionPriority =
  | "critical"
  | "high"
  | "medium"
  | "normal";

export type ExamReadinessLevel =
  | "not_started"
  | "needs_preparation"
  | "in_progress"
  | "nearly_ready"
  | "ready";

export type ExamPerformanceStatus =
  | "not_available"
  | "entered"
  | "evaluated";

export type ExamProjectedRisk =
  | "low"
  | "medium"
  | "high";

export interface ExamSubject {
  id: string;
  code: string;
  name: string;
}

export interface ExamItem {
  id: string;

  subjectId: string;
  subjectCode: string;
  subjectName: string;

  examType: string | null;

  examDate: string;

  startTime: string | null;
  endTime: string | null;

  room: string | null;

  maxMarks: number | null;

  status:
    | "upcoming"
    | "today"
    | "completed";

  daysRemaining: number;
}

export interface ExamTopicProgress {
  id: string;

  examId: string;

  topicId: string;

  unitId: string | null;

  topicName: string;

  unitName: string | null;

  status: ExamPreparationStatus;

  coveragePercentage: number;

  confidenceLevel: number;

  estimatedMinutes: number;

  actualMinutes: number;

  lastStudiedAt: string | null;

  isWeak: boolean;
}

export interface ExamSubjectPreparation {
  subjectId: string;

  subjectCode: string;

  subjectName: string;

  examId: string;

  examDate: string;

  daysRemaining: number;

  totalTopics: number;

  completedTopics: number;

  inProgressTopics: number;

  weakTopics: number;

  coveragePercentage: number;

  confidencePercentage: number;

  estimatedMinutes: number;

  actualMinutes: number;

  readiness:
    | ExamReadinessLevel;
}

export interface ExamRevisionPlan {
  id: string;

  examId: string;

  title: string;

  description: string | null;

  startDate: string | null;

  endDate: string | null;

  availableMinutesPerDay: number;

  status:
    | "draft"
    | "active"
    | "completed"
    | "archived";

  generatedBy:
    | "manual"
    | "rule_engine"
    | "ai";

  items: ExamRevisionItem[];
}

export interface ExamRevisionItem {
  id: string;

  topicId: string | null;

  topicName: string | null;

  scheduledDate: string;

  title: string;

  description: string | null;

  plannedMinutes: number;

  actualMinutes: number;

  priority: ExamRevisionPriority;

  status: ExamRevisionItemStatus;

  completedAt: string | null;
}

export interface ExamPerformance {
  id: string;

  examId: string;

  marks: number | null;

  maxMarks: number | null;

  percentage: number | null;

  grade: string | null;

  rank: number | null;

  status: ExamPerformanceStatus;

  strengths: string[];

  weaknesses: string[];

  facultyFeedback: string | null;
}

export interface ExamPerformanceSummary {
  totalExams: number;

  evaluatedExams: number;

  averagePercentage: number | null;

  highestPercentage: number | null;

  lowestPercentage: number | null;

  strongestSubject:
    | string
    | null;

  weakestSubject:
    | string
    | null;
}

export interface ExamCountdown {
  examId: string;

  examDate: string;

  days: number;

  hours: number;

  minutes: number;

  seconds: number;

  isToday: boolean;

  isPast: boolean;
}

export interface ExamPreparationSummary {
  overallCoveragePercentage: number;

  overallConfidencePercentage: number;

  totalTopics: number;

  completedTopics: number;

  weakTopics: number;

  totalEstimatedMinutes: number;

  totalActualMinutes: number;

  readiness:
    | ExamReadinessLevel;
}

export interface ExamIntelligenceData {
  exams: ExamItem[];

  upcomingExams: ExamItem[];

  subjectPreparation:
    ExamSubjectPreparation[];

  topicProgress:
    ExamTopicProgress[];

  revisionPlan:
    ExamRevisionPlan | null;

  performance:
    ExamPerformance[];

  performanceSummary:
    ExamPerformanceSummary;

  preparationSummary:
    ExamPreparationSummary;

  lastUpdated: string;
}