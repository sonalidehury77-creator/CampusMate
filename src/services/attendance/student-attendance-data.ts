import { createClient } from "@/lib/supabase/server";

import type {
  AttendanceStatus,
  AttendanceRecord,
  SubjectAttendance,
  MonthlyAttendance,
  AttendanceCalendarDay,
  AttendancePrediction,
  StudentAttendanceData,
} from "@/types/attendance";

import {
  calculateAttendance,
} from "@/lib/attendance/calculations";

const FALLBACK_REQUIRED_PERCENTAGE = 75;

/**
 * Convert a database attendance status into
 * the application's supported AttendanceStatus.
 */
function normalizeStatus(
  value: string,
): AttendanceStatus {
  if (
    value === "present" ||
    value === "late" ||
    value === "excused"
  ) {
    return value;
  }

  return "absent";
}

/**
 * Type guard used after mapping database rows.
 *
 * The important point is that the input is explicitly
 * AttendanceRecord | null, so TypeScript knows that
 * the returned array contains only AttendanceRecord.
 */
function isAttendanceRecord(
  record: AttendanceRecord | null,
): record is AttendanceRecord {
  return record !== null;
}

/**
 * Convert a date into YYYY-MM.
 */
function formatMonth(
  date: Date,
): string {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}

/**
 * Convert a date into a readable month label.
 */
function formatMonthLabel(
  date: Date,
): string {
  return date.toLocaleDateString(
    "en-IN",
    {
      month: "short",
      year: "numeric",
    },
  );
}

/**
 * Determine risk level from attendance percentage.
 */
function getSubjectRiskLevel(
  percentage: number,
  requiredPercentage: number,
  countedClasses: number,
):
  | "healthy"
  | "at-risk"
  | "shortage"
  | "critical" {
  if (countedClasses === 0) {
    return "healthy";
  }

  if (
    percentage <
    requiredPercentage - 10
  ) {
    return "critical";
  }

  if (
    percentage <
    requiredPercentage
  ) {
    return "shortage";
  }

  if (
    percentage <
    requiredPercentage + 5
  ) {
    return "at-risk";
  }

  return "healthy";
}

export async function getStudentAttendanceData(
  userId: string,
): Promise<StudentAttendanceData> {
  const supabase =
    await createClient();

  /*
   * ==========================================================
   * 1. STUDENT
   * ==========================================================
   */

  const {
    data: student,
    error: studentError,
  } =
    await supabase
      .from("students")
      .select(
        "id, semester_id",
      )
      .eq(
        "profile_id",
        userId,
      )
      .maybeSingle();

  if (studentError) {
    throw new Error(
      `Unable to load student: ${studentError.message}`,
    );
  }

  if (!student) {
    throw new Error(
      "Student record not found.",
    );
  }

  /*
   * ==========================================================
   * 2. ENROLLED SUBJECTS
   * ==========================================================
   */

  const {
    data: enrollments,
    error:
      enrollmentError,
  } =
    await supabase
      .from(
        "student_subjects",
      )
      .select(
        "subject_id",
      )
      .eq(
        "student_id",
        student.id,
      );

  if (enrollmentError) {
    throw new Error(
      `Unable to load enrolled subjects: ${enrollmentError.message}`,
    );
  }

  const subjectIds =
    (enrollments ?? []).map(
      (row) =>
        row.subject_id,
    );

  /*
   * ==========================================================
   * 3. NO ENROLLED SUBJECTS
   * ==========================================================
   */

  if (
    subjectIds.length ===
    0
  ) {
    return {
      overall: {
        attendedClasses: 0,

        presentClasses: 0,
        lateClasses: 0,

        countedClasses: 0,

        absentClasses: 0,
        excusedClasses: 0,

        totalClasses: 0,

        percentage: 0,

        requiredPercentage:
          FALLBACK_REQUIRED_PERCENTAGE,

        classesCanMiss: 0,

        classesRequiredToReachTarget:
          0,

        isBelowRequired: false,

        isAtRisk: false,

        isSafe: false,

        riskLevel: "healthy",
      },

      subjects: [],

      monthlyTrend: [],

      calendar: [],

      recentRecords: [],

      prediction: {
        currentPercentage: 0,

        projectedPercentage: 0,

        windowDays: 30,

        futureClasses: 0,

        recentAttendanceRate: 0,

        projectedStatus:
          "warning",

        explanation:
          "No enrolled subjects or attendance sessions are available yet.",
      },
    };
  }

  /*
   * ==========================================================
   * 4. SUBJECTS
   * ==========================================================
   */

  const {
    data: subjects,
    error: subjectError,
  } =
    await supabase
      .from("subjects")
      .select(
        "id, code, name",
      )
      .in(
        "id",
        subjectIds,
      );

  if (subjectError) {
    throw new Error(
      `Unable to load subjects: ${subjectError.message}`,
    );
  }

  /*
   * ==========================================================
   * 5. ATTENDANCE SESSIONS
   * ==========================================================
   */

  const {
    data: sessions,
    error: sessionError,
  } =
    await supabase
      .from(
        "attendance_sessions",
      )
      .select(
        `
          id,
          subject_id,
          session_date,
          timetable_entry_id
        `,
      )
      .in(
        "subject_id",
        subjectIds,
      )
      .order(
        "session_date",
        {
          ascending: false,
        },
      );

  if (sessionError) {
    throw new Error(
      `Unable to load attendance sessions: ${sessionError.message}`,
    );
  }

  const sessionRows =
    sessions ?? [];

  const sessionIds =
    sessionRows.map(
      (session) =>
        session.id,
    );

  /*
   * ==========================================================
   * 6. STUDENT ATTENDANCE RECORDS
   * ==========================================================
   */

  let recordRows: {
    id: string;
    session_id: string;
    student_id: string;
    status: string;
    marked_at: string;
  }[] = [];

  if (
    sessionIds.length > 0
  ) {
    const {
      data: records,
      error: recordError,
    } =
      await supabase
        .from(
          "attendance_records",
        )
        .select(
          `
            id,
            session_id,
            student_id,
            status,
            marked_at
          `,
        )
        .eq(
          "student_id",
          student.id,
        )
        .in(
          "session_id",
          sessionIds,
        );

    if (recordError) {
      throw new Error(
        `Unable to load attendance records: ${recordError.message}`,
      );
    }

    recordRows =
      records ?? [];
  }

  /*
   * ==========================================================
   * 7. ATTENDANCE POLICIES
   * ==========================================================
   */

  const {
    data: policies,
    error: policyError,
  } =
    await supabase
      .from(
        "attendance_policies",
      )
      .select(
        `
          subject_id,
          required_percentage,
          prediction_window_days,
          enabled
        `,
      )
      .in(
        "subject_id",
        subjectIds,
      );

  if (policyError) {
    throw new Error(
      `Unable to load attendance policies: ${policyError.message}`,
    );
  }

  const policyMap =
    new Map(
      (policies ?? []).map(
        (policy) => [
          policy.subject_id,
          policy,
        ],
      ),
    );

  /*
   * ==========================================================
   * 8. LOOKUP MAPS
   * ==========================================================
   */

  const subjectMap =
    new Map(
      (subjects ?? []).map(
        (subject) => [
          subject.id,
          subject,
        ],
      ),
    );

  const sessionMap =
    new Map(
      sessionRows.map(
        (session) => [
          session.id,
          session,
        ],
      ),
    );

  /*
   * ==========================================================
   * 9. NORMALIZE ATTENDANCE RECORDS
   * ==========================================================
   *
   * IMPORTANT:
   *
   * We explicitly tell TypeScript that the callback returns
   * AttendanceRecord | null.
   *
   * Therefore the following filter is a valid type guard:
   *
   * record is AttendanceRecord
   *
   * and the final `records` variable becomes:
   *
   * AttendanceRecord[]
   *
   * This fixes all of the "record is possibly null" errors.
   */

  const records: AttendanceRecord[] =
    recordRows
      .map(
        (
          record,
        ): AttendanceRecord | null => {
          const session =
            sessionMap.get(
              record.session_id,
            );

          if (!session) {
            return null;
          }

          const subject =
            subjectMap.get(
              session.subject_id,
            );

          if (!subject) {
            return null;
          }

          return {
            id: record.id,

            sessionId:
              record.session_id,

            studentId:
              record.student_id,

            subjectId:
              session.subject_id,

            subjectCode:
              subject.code,

            subjectName:
              subject.name,

            sessionDate:
              session.session_date,

            /*
             * Timetable information can be connected later.
             * null is valid according to AttendanceRecord.
             */
            startTime: null,

            endTime: null,

            room: null,

            status:
              normalizeStatus(
                record.status,
              ),
          };
        },
      )
      .filter(
        isAttendanceRecord,
      );

  /*
   * ==========================================================
   * 10. OVERALL ATTENDANCE
   * ==========================================================
   */

  const overallRequired =
    records.length > 0
      ? Math.min(
          ...records.map(
            (record) =>
              Number(
                policyMap.get(
                  record.subjectId,
                )
                  ?.required_percentage ??
                  FALLBACK_REQUIRED_PERCENTAGE,
              ),
          ),
        )
      : FALLBACK_REQUIRED_PERCENTAGE;

  const overallCalculation =
    calculateAttendance(
      records.map(
        (record) =>
          record.status,
      ),
      overallRequired,
    );

  const overallPresent =
    records.filter(
      (record) =>
        record.status ===
        "present",
    ).length;

  const overallLate =
    records.filter(
      (record) =>
        record.status ===
        "late",
    ).length;

  const overallTotal =
    records.length;

  const overallIsBelowRequired =
    overallCalculation.percentage <
    overallRequired;

  const overallIsAtRisk =
    overallTotal > 0 &&
    overallCalculation.percentage <
      overallRequired + 5;

  const overallIsSafe =
    overallTotal > 0 &&
    overallCalculation.percentage >=
      overallRequired;

  /*
   * ==========================================================
   * 11. SUBJECT-WISE ATTENDANCE
   * ==========================================================
   */

  const subjectAttendance:
    SubjectAttendance[] =
    (subjects ?? [])
      .map(
        (subject) => {
          const subjectRecords =
            records.filter(
              (record) =>
                record.subjectId ===
                subject.id,
            );

          const requiredPercentage =
            Number(
              policyMap.get(
                subject.id,
              )
                ?.required_percentage ??
                FALLBACK_REQUIRED_PERCENTAGE,
            );

          const calculation =
            calculateAttendance(
              subjectRecords.map(
                (record) =>
                  record.status,
              ),
              requiredPercentage,
            );

          const presentClasses =
            subjectRecords.filter(
              (record) =>
                record.status ===
                "present",
            ).length;

          const lateClasses =
            subjectRecords.filter(
              (record) =>
                record.status ===
                "late",
            ).length;

          const totalClasses =
            subjectRecords.length;

          const isBelowRequired =
            calculation.isBelowRequired;

          const isAtRisk =
            totalClasses > 0 &&
            calculation.percentage <
              requiredPercentage + 5;

          const isSafe =
            totalClasses > 0 &&
            calculation.percentage >=
              requiredPercentage;

          return {
            subjectId:
              subject.id,

            subjectCode:
              subject.code,

            subjectName:
              subject.name,

            attendedClasses:
              calculation.attendedClasses,

            presentClasses,

            lateClasses,

            countedClasses:
              calculation.countedClasses,

            absentClasses:
              calculation.absentClasses,

            excusedClasses:
              calculation.excusedClasses,

            totalClasses,

            percentage:
              calculation.percentage,

            attendancePercentage:
              calculation.percentage,

            requiredPercentage,

            classesCanMiss:
              calculation.classesCanMiss,

            classesRequiredToReachTarget:
              calculation.classesRequiredToReachTarget,

            isBelowRequired,

            isAtRisk,

            isSafe,

            riskLevel:
              getSubjectRiskLevel(
                calculation.percentage,
                requiredPercentage,
                calculation.countedClasses,
              ),
          };
        },
      )
      .sort(
        (a, b) =>
          a.percentage -
          b.percentage,
      );

  /*
   * ==========================================================
   * 12. MONTHLY ATTENDANCE TREND
   * ==========================================================
   */

  const monthlyMap =
    new Map<
      string,
      {
        date: Date;
        statuses: AttendanceStatus[];
      }
    >();

  records.forEach(
    (record) => {
      const date =
        new Date(
          `${record.sessionDate}T00:00:00`,
        );

      const key =
        formatMonth(date);

      const existing =
        monthlyMap.get(key);

      if (existing) {
        existing.statuses.push(
          record.status,
        );
      } else {
        monthlyMap.set(
          key,
          {
            date,
            statuses: [
              record.status,
            ],
          },
        );
      }
    },
  );

  const monthlyTrend:
    MonthlyAttendance[] =
    Array.from(
      monthlyMap.entries(),
    )
      .sort(
        ([a], [b]) =>
          a.localeCompare(b),
      )
      .map(
        ([, value]) => {
          const calculation =
            calculateAttendance(
              value.statuses,
              overallRequired,
            );

          return {
            month:
              formatMonth(
                value.date,
              ),

            label:
              formatMonthLabel(
                value.date,
              ),

            attendedClasses:
              calculation.attendedClasses,

            countedClasses:
              calculation.countedClasses,

            percentage:
              calculation.percentage,
          };
        },
      );

  /*
   * ==========================================================
   * 13. ATTENDANCE CALENDAR
   * ==========================================================
   */

  const calendar:
    AttendanceCalendarDay[] =
    records
      .map(
        (record) => ({
          date:
            record.sessionDate,

          status:
            record.status,

          subjectCode:
            record.subjectCode,

          subjectName:
            record.subjectName,
        }),
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(
            b.date,
          ),
      );

  /*
   * ==========================================================
   * 14. PREDICTION WINDOW
   * ==========================================================
   */

  const predictionWindow =
    Math.max(
      7,
      Math.min(
        365,
        Math.max(
          ...(subjects ?? []).map(
            (subject) =>
              Number(
                policyMap.get(
                  subject.id,
                )
                  ?.prediction_window_days ??
                  30,
              ),
          ),
          30,
        ),
      ),
    );

  const today =
    new Date();

  /*
   * ==========================================================
   * 15. RECENT ATTENDANCE RATE
   * ==========================================================
   */

  const recentRecordsForPrediction =
    records.filter(
      (record) => {
        const date =
          new Date(
            `${record.sessionDate}T00:00:00`,
          );

        const difference =
          today.getTime() -
          date.getTime();

        return (
          difference >= 0 &&
          difference <=
            30 *
              24 *
              60 *
              60 *
              1000
        );
      },
    );

  const recentCalculation =
    calculateAttendance(
      recentRecordsForPrediction.map(
        (record) =>
          record.status,
      ),
      overallRequired,
    );

  const recentAttendanceRate =
    recentRecordsForPrediction.length >
    0
      ? recentCalculation.percentage
      : overallCalculation.percentage;

  /*
   * ==========================================================
   * 16. TIMETABLE
   * ==========================================================
   */

  const {
    data: timetableEntries,
    error:
      timetableError,
  } =
    await supabase
      .from(
        "timetable_entries",
      )
      .select(
        `
          id,
          subject_id,
          day_of_week,
          start_time,
          end_time
        `,
      )
      .eq(
        "semester_id",
        student.semester_id,
      )
      .in(
        "subject_id",
        subjectIds,
      );

  if (timetableError) {
    throw new Error(
      `Unable to load timetable for attendance prediction: ${timetableError.message}`,
    );
  }

  /*
   * ==========================================================
   * 17. FUTURE CLASSES
   * ==========================================================
   */

  const uniqueScheduleKeys =
    new Set<string>();

  for (
    const entry of
      timetableEntries ?? []
  ) {
    for (
      let offset = 1;
      offset <=
      predictionWindow;
      offset++
    ) {
      const date =
        new Date(today);

      date.setDate(
        date.getDate() +
          offset,
      );

      if (
        date.getDay() !==
        entry.day_of_week
      ) {
        continue;
      }

      const key =
        `${date.toISOString().slice(0, 10)}-${entry.id}`;

      uniqueScheduleKeys.add(
        key,
      );
    }
  }

  const futureClasses =
    uniqueScheduleKeys.size;

  /*
   * ==========================================================
   * 18. ATTENDANCE PROJECTION
   * ==========================================================
   */

  const projectedFutureAttended =
    Math.round(
      futureClasses *
        (recentAttendanceRate /
          100),
    );

  const projectedAttended =
    overallCalculation.attendedClasses +
    projectedFutureAttended;

  const projectedCounted =
    overallCalculation.countedClasses +
    futureClasses;

  const projectedPercentage =
    projectedCounted === 0
      ? overallCalculation.percentage
      : Math.round(
          (projectedAttended /
            projectedCounted) *
            10000,
        ) / 100;

  let projectedStatus:
    | "safe"
    | "warning"
    | "risk";

  if (
    projectedPercentage >=
    overallRequired
  ) {
    projectedStatus =
      "safe";
  } else if (
    projectedPercentage >=
    overallRequired - 5
  ) {
    projectedStatus =
      "warning";
  } else {
    projectedStatus =
      "risk";
  }

  const prediction:
    AttendancePrediction = {
      currentPercentage:
        overallCalculation.percentage,

      projectedPercentage,

      windowDays:
        predictionWindow,

      futureClasses,

      recentAttendanceRate,

      projectedStatus,

      explanation:
        `Based on your recent ${recentAttendanceRate}% attendance rate and approximately ${futureClasses} scheduled classes in the next ${predictionWindow} days, your projected attendance is ${projectedPercentage}%.`,
    };

  /*
   * ==========================================================
   * 19. RECENT RECORDS
   * ==========================================================
   *
   * `records` is already AttendanceRecord[].
   * Therefore no null filtering is necessary here.
   */

  const recentRecords:
    AttendanceRecord[] =
    [...records]
      .sort(
        (a, b) =>
          new Date(
            b.sessionDate,
          ).getTime() -
          new Date(
            a.sessionDate,
          ).getTime(),
      )
      .slice(0, 30);

  /*
   * ==========================================================
   * 20. FINAL RESULT
   * ==========================================================
   */

  return {
    overall: {
      attendedClasses:
        overallCalculation.attendedClasses,

      presentClasses:
        overallPresent,

      lateClasses:
        overallLate,

      countedClasses:
        overallCalculation.countedClasses,

      absentClasses:
        overallCalculation.absentClasses,

      excusedClasses:
        overallCalculation.excusedClasses,

      totalClasses:
        overallTotal,

      percentage:
        overallCalculation.percentage,

      requiredPercentage:
        overallRequired,

      classesCanMiss:
        overallCalculation.classesCanMiss,

      classesRequiredToReachTarget:
        overallCalculation.classesRequiredToReachTarget,

      isBelowRequired:
        overallIsBelowRequired,

      isAtRisk:
        overallIsAtRisk,

      isSafe:
        overallIsSafe,

      riskLevel:
        getSubjectRiskLevel(
          overallCalculation.percentage,
          overallRequired,
          overallCalculation.countedClasses,
        ),
    },

    subjects:
      subjectAttendance,

    monthlyTrend,

    calendar,

    recentRecords,

    prediction,
  };
}