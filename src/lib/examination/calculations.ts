import type {
  ExamReadinessLevel,
  ExamRevisionPriority,
} from "@/types/examination";

export function clampPercentage(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(100, value),
  );
}

export function calculateCoverage(
  completedTopics: number,
  totalTopics: number,
): number {
  if (totalTopics === 0) {
    return 0;
  }

  return Math.round(
    (completedTopics /
      totalTopics) *
      10000,
  ) / 100;
}

export function calculateAverage(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  return Math.round(
    (values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) /
      values.length) *
      100,
  ) / 100;
}

export function calculateReadiness(
  coveragePercentage: number,
  confidencePercentage: number,
  daysRemaining: number,
): ExamReadinessLevel {
  if (
    daysRemaining < 0
  ) {
    return "nearly_ready";
  }

  if (
    coveragePercentage === 0 &&
    confidencePercentage === 0
  ) {
    return "not_started";
  }

  if (
    coveragePercentage >= 90 &&
    confidencePercentage >= 80
  ) {
    return "ready";
  }

  if (
    coveragePercentage >= 70 &&
    confidencePercentage >= 60
  ) {
    return "nearly_ready";
  }

  if (
    coveragePercentage > 0 ||
    confidencePercentage > 0
  ) {
    return "in_progress";
  }

  return "needs_preparation";
}

export function calculateWeakTopic(
  coveragePercentage: number,
  confidencePercentage: number,
): boolean {
  return (
    coveragePercentage < 60 ||
    confidencePercentage < 50
  );
}

export function calculateRevisionPriority(
  coveragePercentage: number,
  confidenceLevel: number,
  daysRemaining: number,
): ExamRevisionPriority {
  const coverage = Math.max(
    0,
    Math.min(100, coveragePercentage),
  );

  const confidence = Math.max(
    0,
    Math.min(100, confidenceLevel),
  );

  const days = Math.max(
    0,
    daysRemaining,
  );

  /*
   * CRITICAL
   *
   * Extremely poor preparation.
   */
  if (
    coverage < 30 ||
    confidence < 30
  ) {
    return "critical";
  }

  /*
   * CRITICAL
   *
   * Exam is extremely close and preparation
   * is still significantly incomplete.
   */
  if (
    days <= 3 &&
    (
      coverage < 50 ||
      confidence < 50
    )
  ) {
    return "critical";
  }

  /*
   * HIGH
   *
   * Significant preparation gap.
   */
  if (
    coverage < 50 ||
    confidence < 50
  ) {
    return "high";
  }

  /*
   * HIGH
   *
   * Exam is approaching and preparation
   * is not sufficiently complete.
   */
  if (
    days <= 10 &&
    (
      coverage < 70 ||
      confidence < 70
    )
  ) {
    return "high";
  }

  /*
   * MEDIUM
   *
   * Moderate preparation gap or
   * moderately approaching examination.
   */
  if (
    coverage < 70 ||
    confidence < 70 ||
    days <= 14
  ) {
    return "medium";
  }

  /*
   * NORMAL
   *
   * Good preparation and sufficient time.
   */
  return "normal";
}

export function calculateDaysRemaining(
  examDate: string,
  now = new Date(),
): number {
  const exam = new Date(
    `${examDate}T23:59:59`,
  );

  const difference =
    exam.getTime() -
    now.getTime();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24),
  );
}

export function calculateExamPercentage(
  marks: number | null,
  maxMarks: number | null,
): number | null {
  if (
    marks === null ||
    maxMarks === null ||
    maxMarks <= 0
  ) {
    return null;
  }

  return Math.round(
    (marks / maxMarks) *
      10000,
  ) / 100;
}

export function getGradeFromPercentage(
  percentage: number | null,
): string | null {
  if (percentage === null) {
    return null;
  }

  if (percentage >= 90) {
    return "A+";
  }

  if (percentage >= 80) {
    return "A";
  }

  if (percentage >= 70) {
    return "B+";
  }

  if (percentage >= 60) {
    return "B";
  }

  if (percentage >= 50) {
    return "C";
  }

  if (percentage >= 40) {
    return "D";
  }

  return "F";
}