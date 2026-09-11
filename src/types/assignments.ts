export type AssignmentPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type AssignmentStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue";

export type Assignment = {
  id: string;

  subjectId: string;
  subjectCode: string;
  subjectName: string;

  facultyId: string | null;

  title: string;
  description: string | null;

  dueDate: string | null;

  priority: AssignmentPriority;

  attachmentUrl: string | null;

  createdAt: string;
  updatedAt: string;

  status: AssignmentStatus;
  studentNotes: string | null;
  completedAt: string | null;

  isOverdue: boolean;
  isDueSoon: boolean;
};

export type AssignmentStats = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueSoon: number;
};

export type AssignmentData = {
  assignments: Assignment[];
  stats: AssignmentStats;
};