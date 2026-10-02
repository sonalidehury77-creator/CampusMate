import { createClient } from "@/lib/supabase/server";
import { requireFaculty } from "@/lib/auth/require-faculty";

import {
  calculateAttendance,
} from "@/lib/attendance/calculations";

export async function getFacultyAttendanceIntelligence() {
  const {
    profile,
  } = await requireFaculty();

  const supabase =
    await createClient();

  /*
   * ==========================================================
   * FACULTY
   * ==========================================================
   */

  const {
    data: faculty,
    error: facultyError,
  } =
    await supabase
      .from("faculty")
      .select("id")
      .eq(
        "profile_id",
        profile.id,
      )
      .maybeSingle();

  if (facultyError) {
    throw new Error(
      facultyError.message,
    );
  }

  if (!faculty) {
    throw new Error(
      "Faculty record not found.",
    );
  }

  /*
   * ==========================================================
   * SUBJECTS
   * ==========================================================
   */

  const {
    data: facultySubjects,
    error:
      facultySubjectsError,
  } =
    await supabase
      .from(
        "faculty_subjects",
      )
      .select(
        `
          subject_id,
          subjects (
            id,
            code,
            name
          )
        `,
      )
      .eq(
        "faculty_id",
        faculty.id,
      );

  if (facultySubjectsError) {
    throw new Error(
      facultySubjectsError.message,
    );
  }

  const subjects =
    (facultySubjects ?? [])
      .map(
        (row) =>
          Array.isArray(
            row.subjects,
          )
            ? row.subjects[0]
            : row.subjects,
      )
      .filter(
        (
          subject,
        ) => Boolean(subject),
      );

  const subjectIds =
    subjects.map(
      (subject) =>
        subject.id,
    );

  if (
    subjectIds.length === 0
  ) {
    return {
      subjects: [],
      students: [],
      totalSessions: 0,
      totalRecords: 0,
    };
  }

  /*
   * ==========================================================
   * SESSIONS
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
          session_date
        `,
      )
      .eq(
        "faculty_id",
        faculty.id,
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
      sessionError.message,
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
   * RECORDS
   * ==========================================================
   */

  const {
    data: records,
    error: recordError,
  } =
    sessionIds.length > 0
      ? await supabase
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
          .in(
            "session_id",
            sessionIds,
          )
      : {
          data: [],
          error: null,
        };

  if (recordError) {
    throw new Error(
      recordError.message,
    );
  }

  const recordRows =
    records ?? [];

  const sessionMap =
    new Map(
      sessionRows.map(
        (session) => [
          session.id,
          session,
        ],
      ),
    );

  const subjectMap =
    new Map(
      subjects.map(
        (subject) => [
          subject.id,
          subject,
        ],
      ),
    );

  /*
   * ==========================================================
   * SUBJECT STATISTICS
   * ==========================================================
   */

  const subjectStatistics =
    subjects.map(
      (subject) => {
        const subjectSessions =
          sessionRows.filter(
            (session) =>
              session.subject_id ===
              subject.id,
          );

        const subjectRecords =
          recordRows.filter(
            (record) =>
              subjectSessions.some(
                (session) =>
                  session.id ===
                  record.session_id,
              ),
          );

        const calculation =
          calculateAttendance(
            subjectRecords.map(
              (record) =>
                record.status as
                  | "present"
                  | "absent"
                  | "late"
                  | "excused",
            ),
            75,
          );

        return {
          subjectId:
            subject.id,

          subjectCode:
            subject.code,

          subjectName:
            subject.name,

          totalSessions:
            subjectSessions.length,

          totalRecords:
            subjectRecords.length,

          percentage:
            calculation.percentage,

          attended:
            calculation.attendedClasses,

          absent:
            calculation.absentClasses,

          excused:
            calculation.excusedClasses,
        };
      },
    );

  /*
   * ==========================================================
   * STUDENT STATISTICS
   * ==========================================================
   */

  const studentIds = [
    ...new Set(
      recordRows.map(
        (record) =>
          record.student_id,
      ),
    ),
  ];

  const {
    data: students,
    error:
      studentError,
  } =
    studentIds.length > 0
      ? await supabase
          .from("students")
          .select(
            `
              id,
              student_number,
              profile_id
            `,
          )
          .in(
            "id",
            studentIds,
          )
      : {
          data: [],
          error: null,
        };

  if (studentError) {
    throw new Error(
      studentError.message,
    );
  }

  const profileIds =
    (students ?? []).map(
      (student) =>
        student.profile_id,
    );

  const {
    data: profiles,
    error:
      profileError,
  } =
    profileIds.length > 0
      ? await supabase
          .from("profiles")
          .select(
            `
              id,
              full_name,
              email
            `,
          )
          .in(
            "id",
            profileIds,
          )
      : {
          data: [],
          error: null,
        };

  if (profileError) {
    throw new Error(
      profileError.message,
    );
  }

  const profileMap =
    new Map(
      (profiles ?? []).map(
        (profile) => [
          profile.id,
          profile,
        ],
      ),
    );

  const studentStatistics =
    (students ?? []).map(
      (student) => {
        const studentRecords =
          recordRows.filter(
            (record) =>
              record.student_id ===
              student.id,
          );

        const calculation =
          calculateAttendance(
            studentRecords.map(
              (record) =>
                record.status as
                  | "present"
                  | "absent"
                  | "late"
                  | "excused",
            ),
            75,
          );

        const profile =
          profileMap.get(
            student.profile_id,
          );

        return {
          studentId:
            student.id,

          studentNumber:
            student.student_number,

          name:
            profile?.full_name ??
            "Student",

          email:
            profile?.email ??
            null,

          percentage:
            calculation.percentage,

          attended:
            calculation.attendedClasses,

          counted:
            calculation.countedClasses,

          absent:
            calculation.absentClasses,

          status:
            calculation.percentage <
            75
              ? "risk"
              : calculation.percentage <
                  80
                ? "warning"
                : "safe",
        };
      },
    )
    .sort(
      (a, b) =>
        a.percentage -
        b.percentage,
    );

  return {
    subjects:
      subjectStatistics,

    students:
      studentStatistics,

    totalSessions:
      sessionRows.length,

    totalRecords:
      recordRows.length,

    sessionMap,
    subjectMap,
  };
}