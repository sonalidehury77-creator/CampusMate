export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

export type AttendanceCounts = {
  present: number;
  absent: number;
  late: number;
  excused: number;
};

export type AttendanceCalculation = {
  attendedClasses: number;
  countedClasses: number;
  absentClasses: number;
  excusedClasses: number;
  percentage: number;
  requiredPercentage: number;
  classesCanMiss: number;
  classesRequiredToReachTarget: number;
  isBelowRequired: boolean;
};

export function roundPercentage(
  value: number,
): number {
  return Math.round(value * 100) / 100;
}

export function isAttended(
  status: AttendanceStatus,
): boolean {
  return (
    status === "present" ||
    status === "late"
  );
}

export function isCounted(
  status: AttendanceStatus,
): boolean {
  return (
    status === "present" ||
    status === "absent" ||
    status === "late"
  );
}

export function countAttendance(
  statuses: AttendanceStatus[],
): AttendanceCounts {
  return {
    present: statuses.filter(
      (status) =>
        status === "present",
    ).length,

    absent: statuses.filter(
      (status) =>
        status === "absent",
    ).length,

    late: statuses.filter(
      (status) =>
        status === "late",
    ).length,

    excused: statuses.filter(
      (status) =>
        status === "excused",
    ).length,
  };
}

export function calculateAttendance(
  statuses: AttendanceStatus[],
  requiredPercentage: number,
): AttendanceCalculation {
  const counts =
    countAttendance(statuses);

  const attendedClasses =
    counts.present +
    counts.late;

  const countedClasses =
    counts.present +
    counts.absent +
    counts.late;

  const absentClasses =
    counts.absent;

  const excusedClasses =
    counts.excused;

  const percentage =
    countedClasses === 0
      ? 0
      : roundPercentage(
          (attendedClasses /
            countedClasses) *
            100,
        );

  const target =
    requiredPercentage / 100;

  let classesCanMiss = 0;

  if (
    countedClasses > 0 &&
    attendedClasses / countedClasses >=
      target
  ) {
    classesCanMiss = Math.max(
      0,
      Math.floor(
        attendedClasses /
          target -
          countedClasses,
      ),
    );
  }

  let classesRequiredToReachTarget = 0;

  if (
    countedClasses > 0 &&
    percentage <
      requiredPercentage
  ) {
    const numerator =
      target *
        countedClasses -
      attendedClasses;

    const denominator =
      1 - target;

    classesRequiredToReachTarget =
      Math.ceil(
        numerator /
          denominator,
      );
  }

  return {
    attendedClasses,
    countedClasses,
    absentClasses,
    excusedClasses,
    percentage,
    requiredPercentage,
    classesCanMiss,
    classesRequiredToReachTarget,
    isBelowRequired:
      countedClasses > 0 &&
      percentage <
        requiredPercentage,
  };
}