import { createClient } from "@/lib/supabase/server";

import type {
  AttendanceData,
  AttendanceRecord,
  AttendanceRiskLevel,
  AttendanceStatus,
  SubjectAttendance,
} from "@/types/attendance";

const REQUIRED_PERCENTAGE = 75;

function roundPercentage(
  value: number,
): number {
  return Math.round(value * 100) / 100;
}

function calculateAttendancePercentage(
  attended: number,
  counted: number,
): number {
  if (counted === 0) {
    return 0;
  }

  return roundPercentage(
    (attended / counted) * 100,
  );
}

function calculateClassesCanMiss(
  attended: number,
  counted: number,
  targetPercentage: number,
): number {
  if (counted === 0) {
    return 0;
  }

  const target =
    targetPercentage / 100;

  if (
    attended / counted <
    target
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      attended / target - counted,
    ),
  );
}

function calculateClassesRequired(
  attended: number,
  counted: number,
  targetPercentage: number,
): number {
  if (counted === 0) {
    return 0;
  }

  const target =
    targetPercentage / 100;

  if (
    attended / counted >=
    target
  ) {
    return 0;
  }

  const numerator =
    target * counted - attended;

  const denominator =
    1 - target;

  if (denominator <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil(
      numerator / denominator,
    ),
  );
}

function getRiskLevel(
  percentage: number,
  requiredPercentage: number,
  countedClasses: number,
): AttendanceRiskLevel {
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

function mapAttendanceStatus(
  value: string,
): AttendanceStatus {
  if (value === "present") {
    return "present";
  }

  if (value === "late") {
    return "late";
  }

  if (value === "excused") {
    return "excused";
  }

  return "absent";
}

function buildSubjectAttendance(
  subjectId: string,
  subjectCode: string,
  subjectName: string,
  records: AttendanceRecord[],
): SubjectAttendance {
  const subjectRecords =
    records.filter(
      (record) =>
        record.subjectId ===
        subjectId,
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

  const absentClasses =
    subjectRecords.filter(
      (record) =>
        record.status ===
        "absent",
    ).length;

  const excusedClasses =
    subjectRecords.filter(
      (record) =>
        record.status ===
        "excused",
    ).length;

  const attendedClasses =
    presentClasses +
    lateClasses;

  const countedClasses =
    presentClasses +
    lateClasses +
    absentClasses;

  const totalClasses =
    subjectRecords.length;

  const percentage =
    calculateAttendancePercentage(
      attendedClasses,
      countedClasses,
    );

  const classesCanMiss =
    calculateClassesCanMiss(
      attendedClasses,
      countedClasses,
      REQUIRED_PERCENTAGE,
    );

  const classesRequiredToReachTarget =
    calculateClassesRequired(
      attendedClasses,
      countedClasses,
      REQUIRED_PERCENTAGE,
    );

  const isBelowRequired =
    countedClasses > 0 &&
    percentage <
      REQUIRED_PERCENTAGE;

  const isAtRisk =
    countedClasses > 0 &&
    percentage <
      REQUIRED_PERCENTAGE + 5;

  const isSafe =
    countedClasses > 0 &&
    percentage >=
      REQUIRED_PERCENTAGE;

  return {
    subjectId,
    subjectCode,
    subjectName,

    attendedClasses,

    presentClasses,
    lateClasses,

    countedClasses,

    absentClasses,
    excusedClasses,

    totalClasses,

    percentage,

    attendancePercentage:
      percentage,

    requiredPercentage:
      REQUIRED_PERCENTAGE,

    classesCanMiss,

    classesRequiredToReachTarget,

    isBelowRequired,

    isAtRisk,

    isSafe,

    riskLevel:
      getRiskLevel(
        percentage,
        REQUIRED_PERCENTAGE,
        countedClasses,
      ),
  };
}

export async function getAttendanceData(
  userId: string,
): Promise<AttendanceData> {
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
  } = await supabase
    .from("students")
    .select("id")
    .eq(
      "profile_id",
      userId,
    )
    .single();

  if (
    studentError ||
    !student
  ) {
    throw new Error(
      "Unable to load your student information.",
    );
  }

  /*
   * ==========================================================
   * 2. ATTENDANCE RECORDS
   * ==========================================================
   */

  const {
    data: attendanceRows,
    error: attendanceError,
  } = await supabase
    .from("attendance_records")
    .select(
      `
        id,
        session_id,
        student_id,
        status
      `,
    )
    .eq(
      "student_id",
      student.id,
    );

  if (attendanceError) {
    throw new Error(
      "Unable to load your attendance records.",
    );
  }

  const records =
    attendanceRows ?? [];

  /*
   * No attendance yet.
   */

  if (records.length === 0) {
    return {
      summary: {
        attendedClasses: 0,
        presentClasses: 0,
        lateClasses: 0,

        countedClasses: 0,

        absentClasses: 0,
        excusedClasses: 0,

        totalClasses: 0,

        percentage: 0,

        requiredPercentage:
          REQUIRED_PERCENTAGE,

        classesCanMiss: 0,

        classesRequiredToReachTarget:
          0,

        isAtRisk: false,
        isSafe: false,

        riskLevel: "healthy",
      },

      subjects: [],

      recentRecords: [],
    };
  }

  /*
   * ==========================================================
   * 3. SESSION IDS
   * ==========================================================
   */

  const sessionIds = [
    ...new Set(
      records.map(
        (record) =>
          record.session_id,
      ),
    ),
  ];

  /*
   * ==========================================================
   * 4. ATTENDANCE SESSIONS
   * ==========================================================
   */

  const {
    data: sessionRows,
    error: sessionError,
  } = await supabase
    .from(
      "attendance_sessions",
    )
    .select(
      `
        id,
        subject_id,
        timetable_entry_id,
        session_date
      `,
    )
    .in(
      "id",
      sessionIds,
    );

  if (sessionError) {
    throw new Error(
      "Unable to load attendance sessions.",
    );
  }

  const sessions =
    sessionRows ?? [];

  /*
   * ==========================================================
   * 5. SUBJECTS
   * ==========================================================
   */

  const subjectIds = [
    ...new Set(
      sessions.map(
        (session) =>
          session.subject_id,
      ),
    ),
  ];

  const {
    data: subjectRows,
    error: subjectError,
  } = await supabase
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
      "Unable to load attendance subjects.",
    );
  }

  const subjectMap =
    new Map(
      (subjectRows ?? []).map(
        (subject) => [
          subject.id,
          {
            code:
              subject.code,
            name:
              subject.name,
          },
        ],
      ),
    );

  /*
   * ==========================================================
   * 6. TIMETABLE
   * ==========================================================
   */

  const timetableEntryIds = [
    ...new Set(
      sessions
        .map(
          (session) =>
            session.timetable_entry_id,
        )
        .filter(
          (
            value,
          ): value is string =>
            value !== null,
        ),
    ),
  ];

  const {
    data: timetableRows,
    error: timetableError,
  } =
    timetableEntryIds.length > 0
      ? await supabase
          .from(
            "timetable_entries",
          )
          .select(
            `
              id,
              start_time,
              end_time,
              room
            `,
          )
          .in(
            "id",
            timetableEntryIds,
          )
      : {
          data: [],
          error: null,
        };

  if (timetableError) {
    throw new Error(
      "Unable to load attendance timetable information.",
    );
  }

  const timetableMap =
    new Map(
      (timetableRows ?? []).map(
        (entry) => [
          entry.id,
          {
            startTime:
              entry.start_time,
            endTime:
              entry.end_time,
            room:
              entry.room,
          },
        ],
      ),
    );

  /*
   * ==========================================================
   * 7. SESSION MAP
   * ==========================================================
   */

  const sessionMap =
    new Map(
      sessions.map(
        (session) => [
          session.id,
          session,
        ],
      ),
    );

  /*
   * ==========================================================
   * 8. NORMALIZED RECORDS
   * ==========================================================
   */

  const attendanceRecords =
    records
      .map(
        (record) => {
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

          const timetableEntry =
            session.timetable_entry_id
              ? timetableMap.get(
                  session.timetable_entry_id,
                )
              : undefined;

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

            startTime:
              timetableEntry
                ?.startTime ??
              null,

            endTime:
              timetableEntry
                ?.endTime ??
              null,

            room:
              timetableEntry
                ?.room ??
              null,

            status:
              mapAttendanceStatus(
                record.status,
              ),
          };
        },
      )
      .filter(
        (
          record,
        ): record is AttendanceRecord =>
          record !== null,
      );

  /*
   * ==========================================================
   * 9. OVERALL CALCULATION
   * ==========================================================
   */

  const presentClasses =
    attendanceRecords.filter(
      (record) =>
        record.status ===
        "present",
    ).length;

  const lateClasses =
    attendanceRecords.filter(
      (record) =>
        record.status ===
        "late",
    ).length;

  const absentClasses =
    attendanceRecords.filter(
      (record) =>
        record.status ===
        "absent",
    ).length;

  const excusedClasses =
    attendanceRecords.filter(
      (record) =>
        record.status ===
        "excused",
    ).length;

  const attendedClasses =
    presentClasses +
    lateClasses;

  const countedClasses =
    presentClasses +
    lateClasses +
    absentClasses;

  const totalClasses =
    attendanceRecords.length;

  const percentage =
    calculateAttendancePercentage(
      attendedClasses,
      countedClasses,
    );

  const classesCanMiss =
    calculateClassesCanMiss(
      attendedClasses,
      countedClasses,
      REQUIRED_PERCENTAGE,
    );

  const classesRequiredToReachTarget =
    calculateClassesRequired(
      attendedClasses,
      countedClasses,
      REQUIRED_PERCENTAGE,
    );

  const isAtRisk =
    countedClasses > 0 &&
    percentage <
      REQUIRED_PERCENTAGE + 5;

  const isSafe =
    countedClasses > 0 &&
    percentage >=
      REQUIRED_PERCENTAGE;

  /*
   * ==========================================================
   * 10. SUBJECT-WISE
   * ==========================================================
   */

  const subjectAttendance =
    (subjectRows ?? [])
      .map(
        (subject) =>
          buildSubjectAttendance(
            subject.id,
            subject.code,
            subject.name,
            attendanceRecords,
          ),
      )
      .filter(
        (subject) =>
          subject.totalClasses >
          0,
      )
      .sort(
        (a, b) =>
          a.percentage -
          b.percentage,
      );

  /*
   * ==========================================================
   * 11. RECENT RECORDS
   * ==========================================================
   */

  const recentRecords =
    [...attendanceRecords]
      .sort(
        (a, b) => {
          const dateDifference =
            new Date(
              b.sessionDate,
            ).getTime() -
            new Date(
              a.sessionDate,
            ).getTime();

          if (
            dateDifference !==
            0
          ) {
            return dateDifference;
          }

          return (
            b.startTime ??
            ""
          ).localeCompare(
            a.startTime ??
              "",
          );
        },
      )
      .slice(0, 30);

  /*
   * ==========================================================
   * 12. FINAL RESPONSE
   * ==========================================================
   */

  return {
    summary: {
      attendedClasses,

      presentClasses,
      lateClasses,

      countedClasses,

      absentClasses,
      excusedClasses,

      totalClasses,

      percentage,

      requiredPercentage:
        REQUIRED_PERCENTAGE,

      classesCanMiss,

      classesRequiredToReachTarget,

      isAtRisk,

      isSafe,

      riskLevel:
        getRiskLevel(
          percentage,
          REQUIRED_PERCENTAGE,
          countedClasses,
        ),
    },

    subjects:
      subjectAttendance,

    recentRecords,
  };
}