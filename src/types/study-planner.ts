export type StudyTaskStatus =
  | "pending"
  | "in_progress"
  | "completed";

export type StudyPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type StudySubject = {
  id: string;
  code: string;
  name: string;
};

export type StudyUnit = {
  id: string;
  subjectId: string;
  unitNumber: number;
  title: string;
};

export type StudyTask = {
  id: string;
  studyPlanId: string | null;
  subjectId: string | null;
  unitId: string | null;
  title: string;
  description: string | null;
  scheduledDate: string | null;
  durationMinutes: number;
  priority: StudyPriority;
  status: StudyTaskStatus;
  completedAt: string | null;
  subject: StudySubject | null;
  unit: StudyUnit | null;
};

export type StudyPlan = {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type FocusSession = {
  id: string;
  durationMinutes: number;
  startedAt: string;
  endedAt: string | null;
  subjectId: string | null;
  subject: StudySubject | null;
};

export type StudyPlannerData = {
  plans: StudyPlan[];
  tasks: StudyTask[];
  focusSessions: FocusSession[];
  subjects: StudySubject[];
  units: StudyUnit[];

  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    todayTasks: number;
    todayCompleted: number;
    totalFocusMinutes: number;
    weeklyFocusMinutes: number;
  };
};