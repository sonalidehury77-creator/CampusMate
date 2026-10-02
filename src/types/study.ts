export type StudyPriority =
  | "critical"
  | "high"
  | "medium"
  | "normal";

export type StudyPlanType =
  | "daily"
  | "weekly"
  | "revision"
  | "exam_preparation"
  | "recovery";

export type StudyItemType =
  | "study"
  | "revision"
  | "practice"
  | "assignment"
  | "exam_preparation"
  | "weak_topic"
  | "catch_up";

export type StudyItemStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "partially_completed"
  | "skipped"
  | "cancelled";

export type StudyPlanStatus =
  | "draft"
  | "active"
  | "completed"
  | "expired"
  | "cancelled";

export type StudyGeneratedBy =
  | "manual"
  | "rule_engine"
  | "ai";

export interface StudyPriorityReason {
  examUrgency: number;
  assignmentUrgency: number;
  weakness: number;
  coverageGap: number;
  confidenceGap: number;
  attendanceRisk: number;
  deadlineRisk: number;
  total: number;
  reasons: string[];
}

export interface StudyTaskCandidate {
  id: string;
  subjectId: string | null;
  topicId: string | null;
  examId: string | null;
  assignmentId: string | null;

  title: string;
  description: string | null;

  studyType: StudyItemType;

  priority: StudyPriority;

  priorityScore: number;

  plannedMinutes: number;

  dueDate: string | null;

  subjectName: string | null;
  topicName: string | null;

  coveragePercentage: number;
  confidencePercentage: number;

  attendancePercentage: number | null;

  reason: string[];
}

export interface SmartStudyItem {
  id: string;
  planId: string;

  studentId: string;

  subjectId: string | null;
  topicId: string | null;
  examId: string | null;
  assignmentId: string | null;

  title: string;
  description: string | null;

  studyType: StudyItemType;
  priority: StudyPriority;

  scheduledDate: string;

  startTime: string | null;
  endTime: string | null;

  plannedMinutes: number;
  actualMinutes: number;

  status: StudyItemStatus;

  completionPercentage: number;

  priorityScore: number;
  difficultyScore: number;

  confidenceBefore: number | null;
  confidenceAfter: number | null;

  recommendationReason: {
    reasons: string[];
    score: number;
  };

  completedAt: string | null;
}

export interface SmartStudyPlan {
  id: string;

  studentId: string;

  planDate: string;
  planType: StudyPlanType;

  status: StudyPlanStatus;

  availableMinutes: number;
  plannedMinutes: number;
  completedMinutes: number;

  completionPercentage: number;

  generatedBy: StudyGeneratedBy;

  generationReason: {
    reasons: string[];
  };

  items: SmartStudyItem[];
}

export interface SubjectGoal {
  id: string;

  studentId: string;
  subjectId: string;

  targetCoveragePercentage: number;
  targetConfidencePercentage: number;

  targetExamPercentage: number | null;

  weeklyMinutes: number;

  priority: StudyPriority;

  status:
    | "active"
    | "completed"
    | "paused"
    | "cancelled";

  targetDate: string | null;

  notes: string | null;
}

export interface FocusSession {
  id: string;

  studentId: string;

  studyItemId: string | null;

  subjectId: string | null;

  topicId: string | null;

  startedAt: string;
  endedAt: string | null;

  plannedMinutes: number;
  actualMinutes: number;

  status:
    | "active"
    | "paused"
    | "completed"
    | "abandoned";

  interruptionCount: number;

  completionPercentage: number;

  selfRating: number | null;
  difficultyRating: number | null;

  confidenceBefore: number | null;
  confidenceAfter: number | null;

  notes: string | null;
}

export interface StudyRecommendation {
  id: string;

  type:
    | "exam"
    | "assignment"
    | "weak_subject"
    | "weak_topic"
    | "attendance"
    | "revision"
    | "consistency"
    | "recovery";

  priority: StudyPriority;

  title: string;

  description: string;

  action: string;

  subjectId: string | null;
  topicId: string | null;

  score: number;
}

export interface SmartStudyOverview {
  todayPlan: SmartStudyPlan | null;

  weeklyPlans: SmartStudyPlan[];

  recommendations: StudyRecommendation[];

  subjectGoals: SubjectGoal[];

  activeFocusSession: FocusSession | null;

  totalTodayMinutes: number;
  completedTodayMinutes: number;

  completionPercentage: number;

  streakDays: number;

  lastUpdated: string;
}