import type {
  AcademicRecommendation,
  AcademicRisk,
  HealthLevel,
  HealthMetric,
} from "@/types/academic-health";

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getHealthLevel(score: number): HealthLevel {
  if (score >= 90) {
    return "excellent";
  }

  if (score >= 75) {
    return "good";
  }

  if (score >= 60) {
    return "moderate";
  }

  if (score >= 40) {
    return "needs_attention";
  }

  return "critical";
}

export function createHealthMetric(
  score: number,
  label: string,
  description: string,
): HealthMetric {
  const normalizedScore = clampScore(score);

  return {
    score: normalizedScore,
    level: getHealthLevel(normalizedScore),
    label,
    description,
  };
}

export function calculateAttendanceScore(
  attendancePercentage: number,
): number {
  if (attendancePercentage >= 90) {
    return 100;
  }

  if (attendancePercentage >= 85) {
    return 95;
  }

  if (attendancePercentage >= 80) {
    return 88;
  }

  if (attendancePercentage >= 75) {
    return 75;
  }

  if (attendancePercentage >= 70) {
    return 55;
  }

  if (attendancePercentage >= 60) {
    return 35;
  }

  return 15;
}

export function calculateSyllabusScore(
  progress: number,
): number {
  return clampScore(progress);
}

export function calculateAssignmentScore(
  total: number,
  completed: number,
  overdue: number,
): number {
  if (total === 0) {
    return 75;
  }

  const completionRate =
    (completed / total) * 100;

  const overduePenalty =
    Math.min(overdue * 10, 40);

  return clampScore(
    completionRate - overduePenalty,
  );
}

export function calculateStudyScore(
  plannedMinutes: number,
  completedMinutes: number,
): number {
  if (plannedMinutes <= 0) {
    return 60;
  }

  const completionRate =
    (completedMinutes / plannedMinutes) * 100;

  return clampScore(completionRate);
}

export function calculateExamReadiness(
  syllabusProgress: number,
  studyScore: number,
): number {
  return clampScore(
    syllabusProgress * 0.6 +
      studyScore * 0.4,
  );
}

export function calculateOverallScore(
  attendance: number,
  assignments: number,
  syllabus: number,
  study: number,
  examReadiness: number,
): number {
  return clampScore(
    attendance * 0.2 +
      assignments * 0.2 +
      syllabus * 0.25 +
      study * 0.15 +
      examReadiness * 0.2,
  );
}

export function createAttendanceRisk(
  subjectName: string,
  percentage: number,
): AcademicRisk | null {
  if (percentage >= 75) {
    return null;
  }

  const severity =
    percentage < 60
      ? "high"
      : "medium";

  return {
    id: `attendance-${subjectName}`,
    type: "attendance",
    severity,
    title: `Attendance needs attention in ${subjectName}`,
    description:
      `Current attendance is ${percentage.toFixed(1)}%.`,
    action:
      "Attend upcoming classes consistently and check how many classes you can safely miss.",
    subjectName,
  };
}

export function createAssignmentRisk(
  subjectName: string,
  overdue: number,
): AcademicRisk | null {
  if (overdue === 0) {
    return null;
  }

  return {
    id: `assignment-${subjectName}`,
    type: "assignment",
    severity:
      overdue >= 2 ? "high" : "medium",
    title:
      `${overdue} overdue assignment${
        overdue === 1 ? "" : "s"
      } in ${subjectName}`,
    description:
      "Overdue work can affect academic progress and increase exam pressure.",
    action:
      "Complete the oldest overdue assignment first.",
    subjectName,
  };
}

export function createSyllabusRisk(
  subjectName: string,
  progress: number,
): AcademicRisk | null {
  if (progress >= 60) {
    return null;
  }

  return {
    id: `syllabus-${subjectName}`,
    type: "syllabus",
    severity:
      progress < 35
        ? "high"
        : "medium",
    title:
      `${subjectName} syllabus progress is low`,
    description:
      `Only ${progress}% of tracked syllabus progress is completed.`,
    action:
      "Schedule focused study sessions for the unfinished units.",
    subjectName,
  };
}

export function createRecommendations(
  risks: AcademicRisk[],
): AcademicRecommendation[] {
  return risks.map((risk, index) => ({
    id: `recommendation-${index}-${risk.id}`,
    priority:
      risk.severity === "high"
        ? "high"
        : risk.severity === "medium"
          ? "medium"
          : "low",
    title: risk.title,
    description: risk.description,
    action: risk.action,
    subjectName: risk.subjectName,
  }));
}