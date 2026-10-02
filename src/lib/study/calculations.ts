import type {
  StudyPriority,
  StudyPriorityReason,
} from "@/types/study";

export function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
): number {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

export function calculateStudyPriorityScore(
  examUrgency: number,
  assignmentUrgency: number,
  weakness: number,
  coverageGap: number,
  confidenceGap: number,
  attendanceRisk: number,
  deadlineRisk: number,
): number {
  /*
   * The weights intentionally give academic urgency
   * more importance than secondary signals.
   */

  const score =
    examUrgency * 0.25 +
    assignmentUrgency * 0.15 +
    weakness * 0.20 +
    coverageGap * 0.15 +
    confidenceGap * 0.10 +
    attendanceRisk * 0.05 +
    deadlineRisk * 0.10;

  return Math.round(
    clamp(score) * 100,
  ) / 100;
}

export function getStudyPriority(
  score: number,
): StudyPriority {
  if (score >= 80) {
    return "critical";
  }

  if (score >= 60) {
    return "high";
  }

  if (score >= 35) {
    return "medium";
  }

  return "normal";
}

export function calculateExamUrgency(
  daysRemaining: number,
): number {
  if (daysRemaining <= 0) {
    return 100;
  }

  if (daysRemaining <= 2) {
    return 100;
  }

  if (daysRemaining <= 5) {
    return 90;
  }

  if (daysRemaining <= 7) {
    return 80;
  }

  if (daysRemaining <= 14) {
    return 60;
  }

  if (daysRemaining <= 30) {
    return 35;
  }

  return 10;
}

export function calculateDeadlineUrgency(
  daysRemaining: number,
): number {
  if (daysRemaining <= 0) {
    return 100;
  }

  if (daysRemaining <= 1) {
    return 100;
  }

  if (daysRemaining <= 3) {
    return 90;
  }

  if (daysRemaining <= 7) {
    return 75;
  }

  if (daysRemaining <= 14) {
    return 50;
  }

  if (daysRemaining <= 30) {
    return 25;
  }

  return 5;
}

export function calculateCoverageGap(
  coveragePercentage: number,
  target = 100,
): number {
  return clamp(
    target - coveragePercentage,
  );
}

export function calculateConfidenceGap(
  confidencePercentage: number,
  target = 80,
): number {
  return clamp(
    target - confidencePercentage,
  );
}

export function calculateWeaknessScore(
  coveragePercentage: number,
  confidencePercentage: number,
): number {
  const coverageWeakness =
    clamp(100 - coveragePercentage);

  const confidenceWeakness =
    clamp(100 - confidencePercentage);

  return Math.round(
    (
      coverageWeakness * 0.55 +
      confidenceWeakness * 0.45
    ) * 100,
  ) / 100;
}

export function calculateAttendanceRisk(
  attendancePercentage: number | null,
): number {
  if (
    attendancePercentage === null
  ) {
    return 0;
  }

  if (attendancePercentage < 50) {
    return 100;
  }

  if (attendancePercentage < 60) {
    return 85;
  }

  if (attendancePercentage < 65) {
    return 70;
  }

  if (attendancePercentage < 75) {
    return 50;
  }

  if (attendancePercentage < 80) {
    return 25;
  }

  return 0;
}

export function createPriorityReason(
  values: {
    examUrgency: number;
    assignmentUrgency: number;
    weakness: number;
    coverageGap: number;
    confidenceGap: number;
    attendanceRisk: number;
    deadlineRisk: number;
  },
): StudyPriorityReason {
  const reasons: string[] = [];

  if (values.examUrgency >= 80) {
    reasons.push(
      "An examination is approaching soon.",
    );
  }

  if (values.assignmentUrgency >= 80) {
    reasons.push(
      "An assignment deadline is approaching.",
    );
  }

  if (values.weakness >= 60) {
    reasons.push(
      "This subject or topic needs improvement.",
    );
  }

  if (values.coverageGap >= 40) {
    reasons.push(
      "Syllabus coverage is significantly incomplete.",
    );
  }

  if (values.confidenceGap >= 30) {
    reasons.push(
      "Your confidence level is below the target.",
    );
  }

  if (values.attendanceRisk >= 50) {
    reasons.push(
      "Attendance indicates additional academic risk.",
    );
  }

  if (values.deadlineRisk >= 75) {
    reasons.push(
      "A deadline is close.",
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "This activity supports consistent study progress.",
    );
  }

  return {
    ...values,
    total: calculateStudyPriorityScore(
      values.examUrgency,
      values.assignmentUrgency,
      values.weakness,
      values.coverageGap,
      values.confidenceGap,
      values.attendanceRisk,
      values.deadlineRisk,
    ),
    reasons,
  };
}

export function calculateCompletionPercentage(
  completedMinutes: number,
  plannedMinutes: number,
): number {
  if (plannedMinutes <= 0) {
    return 0;
  }

  return Math.round(
    clamp(
      (completedMinutes / plannedMinutes) * 100,
    ) * 100,
  ) / 100;
}

export function calculateStudyEfficiency(
  plannedMinutes: number,
  actualMinutes: number,
  completionPercentage: number,
): number {
  if (
    plannedMinutes <= 0 ||
    actualMinutes <= 0
  ) {
    return 0;
  }

  const timeEfficiency =
    Math.min(
      100,
      (plannedMinutes / actualMinutes) * 100,
    );

  return Math.round(
    (
      timeEfficiency * 0.4 +
      completionPercentage * 0.6
    ) * 100,
  ) / 100;
}