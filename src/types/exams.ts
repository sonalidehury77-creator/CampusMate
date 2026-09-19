export type Exam = {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semesterId: string;
  examType: string;
  examDate: string;
  startTime: string | null;
  endTime: string | null;
  room: string | null;
};

export type ExamStatus =
  | "completed"
  | "today"
  | "tomorrow"
  | "upcoming"
  | "overdue";

export type ExamReadiness = {
  examId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  examDate: string;

  daysRemaining: number;

  syllabusProgress: number;
  assignmentCompletion: number;
  attendancePercentage: number | null;
  studyConsistency: number;

  readinessPercentage: number;

  status: ExamStatus;

  strengths: string[];
  concerns: string[];
  recommendations: string[];
};

export type ExamData = {
  exams: Exam[];
  upcomingExams: Exam[];
  completedExams: Exam[];
  todayExams: Exam[];
  nextExam: Exam | null;
};

export type ExamDetailData = {
  exam: Exam;
  readiness: ExamReadiness;
};

export type ExamPreparationOverview = {
  totalUpcomingExams: number;
  examsWithinSevenDays: number;
  averageReadiness: number;
  subjectsNeedingRevision: number;
};