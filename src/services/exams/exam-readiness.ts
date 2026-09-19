import type {
  Exam,
  ExamReadiness,
  ExamStatus,
} from "@/types/exams";

function getIndiaToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function calculateDaysRemaining(
  examDate: string,
): number {
  const today = new Date(
    `${getIndiaToday()}T00:00:00+05:30`,
  );

  const exam = new Date(
    `${examDate}T00:00:00+05:30`,
  );

  return Math.round(
    (exam.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

function getExamStatus(
  daysRemaining: number,
): ExamStatus {
  if (daysRemaining < 0) {
    return "completed";
  }

  if (daysRemaining === 0) {
    return "today";
  }

  if (daysRemaining === 1) {
    return "tomorrow";
  }

  return "upcoming";
}

type ReadinessInput = {
  exam: Exam;
  syllabusProgress: number;
  assignmentCompletion: number;
  attendancePercentage: number | null;
  studyConsistency: number;
};

export function calculateExamReadiness(
  input: ReadinessInput,
): ExamReadiness {
  const {
    exam,
    syllabusProgress,
    assignmentCompletion,
    attendancePercentage,
    studyConsistency,
  } = input;

  const daysRemaining =
    calculateDaysRemaining(
      exam.examDate,
    );

  const attendanceScore =
    attendancePercentage === null
      ? 50
      : Math.min(
          100,
          Math.max(
            0,
            attendancePercentage,
          ),
        );

  const readinessPercentage = Math.round(
    syllabusProgress * 0.45 +
      assignmentCompletion * 0.15 +
      attendanceScore * 0.10 +
      studyConsistency * 0.30,
  );

  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  if (syllabusProgress >= 80) {
    strengths.push(
      "Most of the syllabus is covered.",
    );
  } else {
    concerns.push(
      "Syllabus coverage is incomplete.",
    );

    recommendations.push(
      "Prioritize unfinished syllabus units.",
    );
  }

  if (assignmentCompletion >= 80) {
    strengths.push(
      "Assignment completion is strong.",
    );
  } else {
    concerns.push(
      "Some academic work remains incomplete.",
    );

    recommendations.push(
      "Finish pending assignments before intensive revision.",
    );
  }

  if (
    attendancePercentage !== null &&
    attendancePercentage >= 75
  ) {
    strengths.push(
      "Attendance is currently at or above 75%.",
    );
  }

  if (studyConsistency >= 70) {
    strengths.push(
      "Recent study activity is consistent.",
    );
  } else {
    concerns.push(
      "Recent study activity is inconsistent.",
    );

    recommendations.push(
      "Schedule focused study sessions every day.",
    );
  }

  if (daysRemaining <= 7 && daysRemaining >= 0) {
    recommendations.push(
      "Start high-priority revision and practice now.",
    );
  }

  if (daysRemaining > 7) {
    recommendations.push(
      "Use the available time for syllabus coverage and spaced revision.",
    );
  }

  return {
    examId: exam.id,
    subjectId: exam.subjectId,
    subjectCode: exam.subjectCode,
    subjectName: exam.subjectName,
    examDate: exam.examDate,
    daysRemaining,
    syllabusProgress,
    assignmentCompletion,
    attendancePercentage,
    studyConsistency,
    readinessPercentage,
    status: getExamStatus(
      daysRemaining,
    ),
    strengths,
    concerns,
    recommendations,
  };
}