import {
  calculateAttendanceRisk,
  calculateConfidenceGap,
  calculateCoverageGap,
  calculateDeadlineUrgency,
  calculateExamUrgency,
  calculateWeaknessScore,
  getStudyPriority,
} from "./calculations";

import type {
  StudyRecommendation,
} from "@/types/study";

export interface RecommendationInput {
  subjectId: string | null;
  subjectName: string;

  topicId?: string | null;
  topicName?: string | null;

  coveragePercentage: number;
  confidencePercentage: number;

  attendancePercentage: number | null;

  examDaysRemaining?: number | null;
  assignmentDaysRemaining?: number | null;

  hasUpcomingExam: boolean;
  hasUpcomingAssignment: boolean;

  recentStudyMinutes: number;
  targetStudyMinutes: number;
}

export function generateStudyRecommendations(
  inputs: RecommendationInput[],
): StudyRecommendation[] {
  const recommendations:
    StudyRecommendation[] = [];

  for (
    const input of inputs
  ) {
    const weakness =
      calculateWeaknessScore(
        input.coveragePercentage,
        input.confidencePercentage,
      );

    const coverageGap =
      calculateCoverageGap(
        input.coveragePercentage,
      );

    const confidenceGap =
      calculateConfidenceGap(
        input.confidencePercentage,
      );

    const attendanceRisk =
      calculateAttendanceRisk(
        input.attendancePercentage,
      );

    if (
      input.hasUpcomingExam &&
      input.examDaysRemaining !== null &&
      input.examDaysRemaining !== undefined
    ) {
      const score =
        calculateExamUrgency(
          input.examDaysRemaining,
        );

      recommendations.push({
        id:
          `exam-${input.subjectId ?? input.subjectName}`,
        type: "exam",
        priority:
          getStudyPriority(score),
        title:
          `Prepare ${input.subjectName}`,
        description:
          `Your ${input.subjectName} examination is approaching.`,
        action:
          `Schedule focused revision for ${input.subjectName}.`,
        subjectId:
          input.subjectId,
        topicId:
          input.topicId ?? null,
        score,
      });
    }

    if (
      weakness >= 60
    ) {
      const score =
        Math.min(
          100,
          weakness,
        );

      recommendations.push({
        id:
          `weak-${input.subjectId ?? input.subjectName}`,
        type: input.topicId
          ? "weak_topic"
          : "weak_subject",
        priority:
          getStudyPriority(score),
        title:
          input.topicName
            ? `Revise ${input.topicName}`
            : `Strengthen ${input.subjectName}`,
        description:
          `Your preparation in ${input.subjectName} needs additional study.`,
        action:
          input.topicName
            ? `Study ${input.topicName} before moving to new topics.`
            : `Allocate additional weekly study time to ${input.subjectName}.`,
        subjectId:
          input.subjectId,
        topicId:
          input.topicId ?? null,
        score,
      });
    }

    if (
      attendanceRisk >= 50
    ) {
      recommendations.push({
        id:
          `attendance-${input.subjectId ?? input.subjectName}`,
        type: "attendance",
        priority:
          getStudyPriority(
            attendanceRisk,
          ),
        title:
          `Catch up in ${input.subjectName}`,
        description:
          `Attendance indicates that you may need additional academic catch-up.`,
        action:
          `Review missed material and attend upcoming classes consistently.`,
        subjectId:
          input.subjectId,
        topicId:
          input.topicId ?? null,
        score:
          attendanceRisk,
      });
    }

    if (
      input.hasUpcomingAssignment &&
      input.assignmentDaysRemaining !== null &&
      input.assignmentDaysRemaining !== undefined
    ) {
      const score =
        calculateDeadlineUrgency(
          input.assignmentDaysRemaining,
        );

      recommendations.push({
        id:
          `assignment-${input.subjectId ?? input.subjectName}`,
        type: "assignment",
        priority:
          getStudyPriority(score),
        title:
          `Work on ${input.subjectName} assignment`,
        description:
          `An assignment deadline is approaching.`,
        action:
          `Reserve focused study time for the assignment.`,
        subjectId:
          input.subjectId,
        topicId:
          input.topicId ?? null,
        score,
      });
    }

    if (
      input.targetStudyMinutes > 0 &&
      input.recentStudyMinutes <
        input.targetStudyMinutes * 0.5
    ) {
      const deficit =
        Math.round(
          (
            1 -
            input.recentStudyMinutes /
              input.targetStudyMinutes
          ) *
            100,
        );

      recommendations.push({
        id:
          `consistency-${input.subjectId ?? input.subjectName}`,
        type: "consistency",
        priority:
          getStudyPriority(
            deficit,
          ),
        title:
          "Increase study consistency",
        description:
          `You have completed less than half of your recent study target.`,
        action:
          "Schedule a manageable focus session today.",
        subjectId:
          input.subjectId,
        topicId:
          input.topicId ?? null,
        score:
          deficit,
      });
    }

    if (
      coverageGap >= 40 &&
      confidenceGap >= 30
    ) {
      recommendations.push({
        id:
          `revision-${input.subjectId ?? input.subjectName}`,
        type: "revision",
        priority:
          "high",
        title:
          `Start revision for ${input.subjectName}`,
        description:
          "Both syllabus coverage and confidence are below target.",
        action:
          "Review previously studied topics before adding new material.",
        subjectId:
          input.subjectId,
        topicId:
          input.topicId ?? null,
        score:
          Math.max(
            coverageGap,
            confidenceGap,
          ),
      });
    }
  }

  return recommendations
    .sort(
      (a, b) =>
        b.score -
        a.score,
    );
}