import { createClient } from "@/lib/supabase/server";

import type {
  AttendanceData,
  AttendanceRecord,
  AttendanceStatus,
  SubjectAttendance,
} from "@/types/attendance";

const REQUIRED_PERCENTAGE = 75;

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateAttendancePercentage(
  present: number,
  total: number,
): number {
  if (total === 0) {
    return 0;
  }

  return roundPercentage((present / total) * 100);
}

/*
 * Returns the maximum number of additional
 * classes a student can miss while still
 * remaining at or above the target percentage.
 *
 * Current:
 *
 * present / total
 *
 * We find maximum x such that:
 *
 * present / (total + x) >= target / 100
 */
function calculateClassesCanMiss(
  present: number,
  total: number,
  targetPercentage: number,
): number {
  if (total === 0) {
    return 0;
  }

  const target = targetPercentage / 100;

  if (present / total < target) {
    return 0;
  }

  return Math.floor(present / target - total);
}

/*
 * Returns the minimum number of consecutive
 * classes that must be attended to reach
 * the target percentage.
 *
 * We solve:
 *
 * (present + x) / (total + x) >= target
 */
function calculateClassesRequired(
  present: number,
  total: number,
  targetPercentage: number,
): number {
  if (total === 0) {
    return 0;
  }

  const target = targetPercentage / 100;

  if (present / total >= target) {
    return 0;
  }

  const numerator = target * total - present;
  const denominator = 1 - target;

  return Math.ceil(numerator / denominator);
}

function mapAttendanceStatus(
  value: string,
): AttendanceStatus {
  if (value === "present") {
    return "present";
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
  const subjectRecords = records.filter(
    (record) => record.subjectId === subjectId,
  );

  const presentClasses = subjectRecords.filter(
    (record) => record.status === "present",
  ).length;

  const absentClasses = subjectRecords.filter(
    (record) => record.status === "absent",
  ).length;

  const totalClasses = subjectRecords.length;

  const percentage = calculateAttendancePercentage(
    presentClasses,
    totalClasses,
  );

  const classesCanMiss = calculateClassesCanMiss(
    presentClasses,
    totalClasses,
    REQUIRED_PERCENTAGE,
  );

  const classesRequiredToReachTarget =
    calculateClassesRequired(
      presentClasses,
      totalClasses,
      REQUIRED_PERCENTAGE,
    );

  return {
    subjectId,
    subjectCode,
    subjectName,

    presentClasses,
    absentClasses,
    totalClasses,

    percentage,

    requiredPercentage: REQUIRED_PERCENTAGE,

    classesCanMiss,

    classesRequiredToReachTarget,

    isSafe:
      totalClasses > 0 &&
      percentage >= REQUIRED_PERCENTAGE,

    isAtRisk:
      totalClasses > 0 &&
      percentage < REQUIRED_PERCENTAGE,
  };
}

export async function getAttendanceData(
  userId: string,
): Promise<AttendanceData> {
  const supabase = await createClient();

  /*
   * 1. Find the authenticated student's
   * student record.
   */
  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", userId)
    .single();

  if (studentError || !student) {
    throw new Error(
      "Unable to load your student information.",
    );
  }

  /*
   * 2. Load all attendance records
   * belonging to this student.
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
      status
      `,
    )
    .eq("student_id", student.id);

  if (attendanceError) {
    throw new Error(
      "Unable to load your attendance records.",
    );
  }

  const records = attendanceRows ?? [];

  if (records.length === 0) {
    return {
      summary: {
        presentClasses: 0,
        absentClasses: 0,
        totalClasses: 0,
        percentage: 0,
        requiredPercentage: REQUIRED_PERCENTAGE,
        classesCanMiss: 0,
        classesRequiredToReachTarget: 0,
        isSafe: false,
        isAtRisk: false,
      },

      subjects: [],

      recentRecords: [],
    };
  }

  /*
   * 3. Get session IDs.
   */
  const sessionIds = [
    ...new Set(
      records.map(
        (record) => record.session_id,
      ),
    ),
  ];

  /*
   * 4. Load attendance sessions.
   *
   * IMPORTANT:
   *
   * attendance_sessions contains:
   *
   * id
   * subject_id
   * faculty_id
   * timetable_entry_id
   * session_date
   *
   * It does NOT contain:
   *
   * start_time
   * end_time
   * room
   *
   * Therefore those fields are loaded from
   * timetable_entries below.
   */
  const {
    data: sessionRows,
    error: sessionError,
  } = await supabase
    .from("attendance_sessions")
    .select(
      `
      id,
      subject_id,
      timetable_entry_id,
      session_date
      `,
    )
    .in("id", sessionIds);

  if (sessionError) {
    throw new Error(
      "Unable to load attendance sessions.",
    );
  }

  const sessions = sessionRows ?? [];

  /*
   * 5. Get subject IDs.
   */
  const subjectIds = [
    ...new Set(
      sessions.map(
        (session) => session.subject_id,
      ),
    ),
  ];

  /*
   * 6. Load subjects.
   */
  const {
    data: subjectRows,
    error: subjectError,
  } = await supabase
    .from("subjects")
    .select("id, code, name")
    .in("id", subjectIds);

  if (subjectError) {
    throw new Error(
      "Unable to load attendance subjects.",
    );
  }

  const subjectMap = new Map(
    (subjectRows ?? []).map(
      (subject) => [
        subject.id,
        {
          code: subject.code,
          name: subject.name,
        },
      ],
    ),
  );

  /*
   * 7. Get timetable entry IDs.
   *
   * Attendance session -> timetable entry
   *
   * This gives us:
   *
   * start_time
   * end_time
   * room
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
            timetableEntryId,
          ): timetableEntryId is string =>
            timetableEntryId !== null,
        ),
    ),
  ];

  /*
   * 8. Load timetable entries.
   */
  const {
    data: timetableRows,
    error: timetableError,
  } = timetableEntryIds.length > 0
    ? await supabase
        .from("timetable_entries")
        .select(
          `
          id,
          start_time,
          end_time,
          room
          `,
        )
        .in("id", timetableEntryIds)
    : {
        data: [],
        error: null,
      };

  if (timetableError) {
    throw new Error(
      "Unable to load attendance timetable information.",
    );
  }

  const timetableMap = new Map(
    (timetableRows ?? []).map(
      (entry) => [
        entry.id,
        {
          startTime: entry.start_time,
          endTime: entry.end_time,
          room: entry.room,
        },
      ],
    ),
  );

  /*
   * 9. Create maps for quick lookup.
   */
  const sessionMap = new Map(
    sessions.map(
      (session) => [
        session.id,
        session,
      ],
    ),
  );

  /*
   * 10. Convert database rows into
   * application attendance records.
   */
  const attendanceRecords: AttendanceRecord[] =
    records
      .map((record) => {
        const session = sessionMap.get(
          record.session_id,
        );

        if (!session) {
          return null;
        }

        const subject = subjectMap.get(
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

          subjectId:
            session.subject_id,

          subjectCode:
            subject.code,

          subjectName:
            subject.name,

          sessionDate:
            session.session_date,

          startTime:
            timetableEntry?.startTime ?? null,

          endTime:
            timetableEntry?.endTime ?? null,

          room:
            timetableEntry?.room ?? null,

          status:
            mapAttendanceStatus(
              record.status,
            ),
        };
      })
      .filter(
        (
          record,
        ): record is AttendanceRecord =>
          record !== null,
      );

  /*
   * 11. Overall attendance.
   */
  const presentClasses =
    attendanceRecords.filter(
      (record) =>
        record.status === "present",
    ).length;

  const absentClasses =
    attendanceRecords.filter(
      (record) =>
        record.status === "absent",
    ).length;

  const totalClasses =
    attendanceRecords.length;

  const percentage =
    calculateAttendancePercentage(
      presentClasses,
      totalClasses,
    );

  const classesCanMiss =
    calculateClassesCanMiss(
      presentClasses,
      totalClasses,
      REQUIRED_PERCENTAGE,
    );

  const classesRequiredToReachTarget =
    calculateClassesRequired(
      presentClasses,
      totalClasses,
      REQUIRED_PERCENTAGE,
    );

  /*
   * 12. Subject-wise attendance.
   */
  const subjectMapForAttendance =
    new Map<
      string,
      {
        code: string;
        name: string;
      }
    >();

  attendanceRecords.forEach(
    (record) => {
      subjectMapForAttendance.set(
        record.subjectId,
        {
          code: record.subjectCode,
          name: record.subjectName,
        },
      );
    },
  );

  const subjects: SubjectAttendance[] =
    Array.from(
      subjectMapForAttendance.entries(),
    )
      .map(
        ([subjectId, subject]) =>
          buildSubjectAttendance(
            subjectId,
            subject.code,
            subject.name,
            attendanceRecords,
          ),
      )
      .sort(
        (a, b) =>
          a.percentage - b.percentage,
      );

  /*
   * 13. Most recent attendance.
   */
  const recentRecords =
    [...attendanceRecords]
      .sort((a, b) => {
        const dateDifference =
          new Date(
            b.sessionDate,
          ).getTime() -
          new Date(
            a.sessionDate,
          ).getTime();

        if (dateDifference !== 0) {
          return dateDifference;
        }

        return (
          (b.startTime ?? "").localeCompare(
            a.startTime ?? "",
          )
        );
      })
      .slice(0, 20);

  return {
    summary: {
      presentClasses,
      absentClasses,
      totalClasses,
      percentage,

      requiredPercentage:
        REQUIRED_PERCENTAGE,

      classesCanMiss,

      classesRequiredToReachTarget,

      isSafe:
        totalClasses > 0 &&
        percentage >= REQUIRED_PERCENTAGE,

      isAtRisk:
        totalClasses > 0 &&
        percentage < REQUIRED_PERCENTAGE,
    },

    subjects,

    recentRecords,
  };
}