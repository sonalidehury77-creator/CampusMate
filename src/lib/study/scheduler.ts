import {
  calculateAttendanceRisk,
  calculateConfidenceGap,
  calculateCoverageGap,
  calculateDeadlineUrgency,
  calculateExamUrgency,
  calculateWeaknessScore,
  createPriorityReason,
  getStudyPriority,
} from "./calculations";

import type {
  StudyTaskCandidate,
  StudyPriority,
} from "@/types/study";

export interface SchedulerInput {
  candidate: StudyTaskCandidate;

  availableMinutes: number;

  minimumSessionMinutes: number;

  maximumSessionMinutes: number;
}

export interface ScheduledStudyItem {
  candidate: StudyTaskCandidate;

  priority: StudyPriority;

  priorityScore: number;

  plannedMinutes: number;

  reason: string[];
}

export function scoreStudyCandidate(
  candidate: StudyTaskCandidate,
): StudyTaskCandidate {
  const examUrgency =
    candidate.examId
      ? calculateExamUrgency(
          calculateDaysUntil(
            candidate.dueDate,
          ),
        )
      : 0;

  const assignmentUrgency =
    candidate.assignmentId
      ? calculateDeadlineUrgency(
          calculateDaysUntil(
            candidate.dueDate,
          ),
        )
      : 0;

  const deadlineRisk =
    candidate.dueDate
      ? calculateDeadlineUrgency(
          calculateDaysUntil(
            candidate.dueDate,
          ),
        )
      : 0;

  const weakness =
    calculateWeaknessScore(
      candidate.coveragePercentage,
      candidate.confidencePercentage,
    );

  const coverageGap =
    calculateCoverageGap(
      candidate.coveragePercentage,
    );

  const confidenceGap =
    calculateConfidenceGap(
      candidate.confidencePercentage,
    );

  const attendanceRisk =
    calculateAttendanceRisk(
      candidate.attendancePercentage,
    );

  const reason =
    createPriorityReason({
      examUrgency,
      assignmentUrgency,
      weakness,
      coverageGap,
      confidenceGap,
      attendanceRisk,
      deadlineRisk,
    });

  return {
    ...candidate,

    priorityScore:
      reason.total,

    priority:
      getStudyPriority(
        reason.total,
      ),

    reason:
      reason.reasons,
  };
}

export function generateDailySchedule(
  candidates: StudyTaskCandidate[],
  availableMinutes: number,
  minimumSessionMinutes = 25,
  maximumSessionMinutes = 60,
): ScheduledStudyItem[] {
  if (
    availableMinutes <= 0 ||
    candidates.length === 0
  ) {
    return [];
  }

  const scored =
    candidates
      .map(scoreStudyCandidate)
      .sort(
        (a, b) =>
          b.priorityScore -
          a.priorityScore,
      );

  let remainingMinutes =
    availableMinutes;

  const schedule:
    ScheduledStudyItem[] =
    [];

  for (
    const candidate of scored
  ) {
    if (
      remainingMinutes <
      minimumSessionMinutes
    ) {
      break;
    }

    const requested =
      Math.max(
        minimumSessionMinutes,
        Math.min(
          maximumSessionMinutes,
          candidate.plannedMinutes,
        ),
      );

    const plannedMinutes =
      Math.min(
        requested,
        remainingMinutes,
      );

    schedule.push({
      candidate,

      priority:
        candidate.priority,

      priorityScore:
        candidate.priorityScore,

      plannedMinutes,

      reason:
        candidate.reason,
    });

    remainingMinutes -=
      plannedMinutes;
  }

  return schedule;
}

function calculateDaysUntil(
  date: string | null,
): number {
  if (!date) {
    return 999;
  }

  const today =
    new Date();

  const target =
    new Date(
      `${date}T23:59:59`,
    );

  return Math.ceil(
    (
      target.getTime() -
      today.getTime()
    ) /
      (
        1000 *
        60 *
        60 *
        24
      ),
  );
}