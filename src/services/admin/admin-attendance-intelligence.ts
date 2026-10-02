import { createClient } from "@/lib/supabase/server";

import {
  calculateAttendance,
} from "@/lib/attendance/calculations";

export async function getAdminAttendanceIntelligence() {
  const supabase =
    await createClient();

  /*
   * ==========================================================
   * LOAD ALL SESSIONS
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
          faculty_id,
          session_date
        `,
      );

  if (sessionError) {
    throw new Error(
      sessionError.message,
    );
  }

  /*
   * ==========================================================
   * LOAD ALL RECORDS
   * ==========================================================
   */

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
          status
        `,
      );

  if (recordError) {
    throw new Error(
      recordError.message,
    );
  }

  /*
   * ==========================================================
   * SUBJECTS
   * ==========================================================
   */

  const subjectIds = [
    ...new Set(
      (sessions ?? []).map(
        (session) =>
          session.subject_id,
      ),
    ),
  ];

  const {
    data: subjects,
    error: subjectError,
  } =
    subjectIds.length > 0
      ? await supabase
          .from("subjects")
          .select(
            `
              id,
              code,
              name,
              department_id,
              semester_id
            `,
          )
          .in(
            "id",
            subjectIds,
          )
      : {
          data: [],
          error: null,
        };

  if (subjectError) {
    throw new Error(
      subjectError.message,
    );
  }

  /*
   * ==========================================================
   * DEPARTMENTS
   * ==========================================================
   */

  const departmentIds = [
    ...new Set(
      (subjects ?? [])
        .map(
          (subject) =>
            subject.department_id,
        )
        .filter(Boolean),
    ),
  ];

  const {
    data: departments,
    error:
      departmentError,
  } =
    departmentIds.length > 0
      ? await supabase
          .from("departments")
          .select(
            `
              id,
              name
            `,
          )
          .in(
            "id",
            departmentIds,
          )
      : {
          data: [],
          error: null,
        };

  if (departmentError) {
    throw new Error(
      departmentError.message,
    );
  }

  /*
   * ==========================================================
   * STUDENTS
   * ==========================================================
   */

  const studentIds = [
    ...new Set(
      (records ?? []).map(
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
              profile_id,
              program_id,
              semester_id
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

  /*
   * ==========================================================
   * MAPS
   * ==========================================================
   */


  const departmentMap =
    new Map(
      (departments ?? []).map(
        (department) => [
          department.id,
          department,
        ],
      ),
    );

  /*
   * ==========================================================
   * STUDENT RISK
   * ==========================================================
   */

  const studentRisk =
    (students ?? []).map(
      (student) => {
        const studentRecords =
          (records ?? []).filter(
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

        const riskLevel =
          calculation.percentage <
          60
            ? "high"
            : calculation.percentage <
                75
              ? "medium"
              : "low";

        return {
          studentId:
            student.id,

          semesterId:
            student.semester_id,

          attendance:
            calculation.percentage,

          attended:
            calculation.attendedClasses,

          counted:
            calculation.countedClasses,

          absent:
            calculation.absentClasses,

          riskLevel,
        };
      },
    );

  /*
   * ==========================================================
   * DEPARTMENT ANALYTICS
   * ==========================================================
   */

  const departmentAnalytics =
    departmentIds.map(
      (departmentId) => {
        const departmentSubjects =
          (subjects ?? []).filter(
            (subject) =>
              subject.department_id ===
              departmentId,
          );

        const departmentSubjectIds =
          departmentSubjects.map(
            (subject) =>
              subject.id,
          );

        const departmentSessionIds =
          (sessions ?? [])
            .filter(
              (session) =>
                departmentSubjectIds.includes(
                  session.subject_id,
                ),
            )
            .map(
              (session) =>
                session.id,
            );

        const departmentRecords =
          (records ?? []).filter(
            (record) =>
              departmentSessionIds.includes(
                record.session_id,
              ),
          );

        const calculation =
          calculateAttendance(
            departmentRecords.map(
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
          departmentId,

          departmentName:
            departmentMap.get(
              departmentId,
            )?.name ??
            "Department",

          subjects:
            departmentSubjects.length,

          sessions:
            departmentSessionIds.length,

          attendance:
            calculation.percentage,

          studentsAtRisk:
            studentRisk.filter(
              (student) =>
                student.riskLevel ===
                "high",
            ).length,
        };
      },
    );

  /*
   * ==========================================================
   * SEMESTER ANALYTICS
   * ==========================================================
   */

  const semesterIds = [
    ...new Set(
      (subjects ?? []).map(
        (subject) =>
          subject.semester_id,
      ),
    ),
  ];

  const semesterAnalytics =
    semesterIds.map(
      (semesterId) => {
        const semesterSubjects =
          (subjects ?? []).filter(
            (subject) =>
              subject.semester_id ===
              semesterId,
          );

        const semesterSubjectIds =
          semesterSubjects.map(
            (subject) =>
              subject.id,
          );

        const semesterSessionIds =
          (sessions ?? [])
            .filter(
              (session) =>
                semesterSubjectIds.includes(
                  session.subject_id,
                ),
            )
            .map(
              (session) =>
                session.id,
            );

        const semesterRecords =
          (records ?? []).filter(
            (record) =>
              semesterSessionIds.includes(
                record.session_id,
              ),
          );

        const calculation =
          calculateAttendance(
            semesterRecords.map(
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
          semesterId,
          subjects:
            semesterSubjects.length,
          sessions:
            semesterSessionIds.length,
          attendance:
            calculation.percentage,
        };
      },
    );

  /*
   * ==========================================================
   * SUBJECT RISK
   * ==========================================================
   */

  const subjectAnalytics =
    (subjects ?? []).map(
      (subject) => {
        const subjectSessions =
          (sessions ?? []).filter(
            (session) =>
              session.subject_id ===
              subject.id,
          );

        const subjectSessionIds =
          subjectSessions.map(
            (session) =>
              session.id,
          );

        const subjectRecords =
          (records ?? []).filter(
            (record) =>
              subjectSessionIds.includes(
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

          code:
            subject.code,

          name:
            subject.name,

          attendance:
            calculation.percentage,

          sessions:
            subjectSessions.length,
        };
      },
    )
    .sort(
      (a, b) =>
        a.attendance -
        b.attendance,
    );

  return {
    totalSessions:
      sessions?.length ?? 0,

    totalRecords:
      records?.length ?? 0,

    departmentAnalytics,

    semesterAnalytics,

    subjectAnalytics,

    studentRisk:
      studentRisk.sort(
        (a, b) =>
          a.attendance -
          b.attendance,
      ),
  };
}