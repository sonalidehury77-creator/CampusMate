import { createClient } from "@/lib/supabase/server";

import {
  getFacultyStudents,
} from "./faculty-data";


export async function getFacultyIntelligence() {
  const supabase =
    await createClient();

  const students =
    await getFacultyStudents();

  if (students.length === 0) {
    return {
      atRiskStudents: [],
      insights: [],
    };
  }


  // ==========================================================
  // STUDENT IDS
  // ==========================================================

  const studentIds =
    students.map(
      (student) =>
        student.id,
    );


  // ==========================================================
  // ACADEMIC PROGRESS
  // ==========================================================

  const {
    data: progress,
    error: progressError,
  } =
    await supabase
      .from(
        "student_subject_progress",
      )
      .select(`
        student_id,
        subject_id,
        progress_percentage
      `)
      .in(
        "student_id",
        studentIds,
      );

  if (progressError) {
    throw new Error(
      `Failed to load student progress: ${progressError.message}`,
    );
  }


  // ==========================================================
  // ASSIGNMENTS
  // ==========================================================

  const {
    data: assignments,
    error: assignmentsError,
  } =
    await supabase
      .from("assignments")
      .select(`
        id,
        subject_id,
        due_date
      `);

  if (assignmentsError) {
    throw new Error(
      `Failed to load assignments: ${assignmentsError.message}`,
    );
  }


  // ==========================================================
  // ASSIGNMENT STATUS
  // ==========================================================

  const {
    data: assignmentStatuses,
    error: assignmentStatusError,
  } =
    await supabase
      .from(
        "assignment_status",
      )
      .select(`
        assignment_id,
        student_id,
        status
      `)
      .in(
        "student_id",
        studentIds,
      );

  if (assignmentStatusError) {
    throw new Error(
      `Failed to load assignment statuses: ${assignmentStatusError.message}`,
    );
  }


  // ==========================================================
  // ATTENDANCE SESSIONS
  // ==========================================================

  const {
    data: sessions,
    error: sessionError,
  } =
    await supabase
      .from(
        "attendance_sessions",
      )
      .select(`
        id,
        subject_id
      `);

  if (sessionError) {
    throw new Error(
      `Failed to load attendance sessions: ${sessionError.message}`,
    );
  }


  // ==========================================================
  // ATTENDANCE RECORDS
  // ==========================================================

  const sessionIds =
    (sessions ?? []).map(
      (session) =>
        session.id,
    );


  const attendance =
    sessionIds.length > 0
      ? await supabase
          .from(
            "attendance_records",
          )
          .select(`
            session_id,
            student_id,
            status
          `)
          .in(
            "session_id",
            sessionIds,
          )
          .in(
            "student_id",
            studentIds,
          )
      : {
          data: [],
          error: null,
        };


  if (attendance.error) {
    throw new Error(
      `Failed to load attendance records: ${attendance.error.message}`,
    );
  }


  // ==========================================================
  // BUILD AT-RISK STUDENT ANALYSIS
  // ==========================================================

  const atRiskStudents =
    students.map(
      (student) => {

        // ------------------------------------------------------
        // PROGRESS
        // ------------------------------------------------------

        const studentProgress =
          (
            progress ?? []
          ).filter(
            (row) =>
              row.student_id ===
              student.id,
          );


        const averageProgress =
          studentProgress.length > 0
            ? studentProgress.reduce(
                (
                  total,
                  row,
                ) =>
                  total +
                  Number(
                    row.progress_percentage ??
                      0,
                  ),
                0,
              ) /
              studentProgress.length
            : 0;


        // ------------------------------------------------------
        // ASSIGNMENTS
        // ------------------------------------------------------

        const studentStatuses =
          (
            assignmentStatuses ?? []
          ).filter(
            (row) =>
              row.student_id ===
              student.id,
          );


        const overdue =
          studentStatuses.filter(
            (row) => {

              if (
                row.status ===
                "completed"
              ) {
                return false;
              }

              const assignment =
                (
                  assignments ?? []
                ).find(
                  (item) =>
                    item.id ===
                    row.assignment_id,
                );

              if (
                !assignment?.due_date
              ) {
                return false;
              }

              return (
                new Date(
                  assignment.due_date,
                ).getTime() <
                Date.now()
              );
            },
          ).length;


        // ------------------------------------------------------
        // ATTENDANCE
        // ------------------------------------------------------

        const studentAttendance =
          (
            attendance.data ?? []
          ).filter(
            (row) =>
              row.student_id ===
              student.id,
          );


        const attended =
          studentAttendance.filter(
            (row) =>
              row.status ===
                "present" ||
              row.status ===
                "late",
          ).length;


        const attendancePercentage =
          studentAttendance.length >
          0
            ? (
                attended /
                studentAttendance.length
              ) *
              100
            : 100;


        // ------------------------------------------------------
        // RISK SCORE
        // ------------------------------------------------------

        let riskScore = 0;


        if (
          attendancePercentage <
          75
        ) {
          riskScore += 40;
        }


        if (
          averageProgress <
          50
        ) {
          riskScore += 35;
        }


        if (
          overdue >= 2
        ) {
          riskScore += 25;
        }


        const riskLevel =
          riskScore >= 60
            ? "high"
            : riskScore >= 30
              ? "medium"
              : "low";


        return {
          ...student,

          attendance:
            Number(
              attendancePercentage.toFixed(
                1,
              ),
            ),

          averageProgress:
            Number(
              averageProgress.toFixed(
                1,
              ),
            ),

          overdueAssignments:
            overdue,

          riskScore,

          riskLevel,
        };
      },
    );


  // ==========================================================
  // INSIGHTS
  // ==========================================================

  const highRisk =
    atRiskStudents.filter(
      (student) =>
        student.riskLevel ===
        "high",
    );


  const insights: string[] =
    [];


  if (
    highRisk.length > 0
  ) {
    insights.push(
      `${highRisk.length} students currently require immediate academic attention.`,
    );
  }


  const lowAttendance =
    atRiskStudents.filter(
      (student) =>
        student.attendance <
        75,
    ).length;


  if (
    lowAttendance > 0
  ) {
    insights.push(
      `${lowAttendance} students have attendance below 75%.`,
    );
  }


  const lowProgress =
    atRiskStudents.filter(
      (student) =>
        student.averageProgress <
        50,
    ).length;


  if (
    lowProgress > 0
  ) {
    insights.push(
      `${lowProgress} students have academic progress below 50%.`,
    );
  }


  const overdueStudents =
    atRiskStudents.filter(
      (student) =>
        student.overdueAssignments >
        0,
    ).length;


  if (
    overdueStudents > 0
  ) {
    insights.push(
      `${overdueStudents} students have overdue assignments.`,
    );
  }


  if (
    insights.length === 0
  ) {
    insights.push(
      "No major teaching risks detected from the currently recorded data.",
    );
  }


  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    atRiskStudents:
      atRiskStudents
        .sort(
          (a, b) =>
            b.riskScore -
            a.riskScore,
        )
        .slice(
          0,
          20,
        ),

    insights,
  };
}