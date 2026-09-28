"use server";

import { createClient } from "@/lib/supabase/server";

import type {
  FacultyAssignment,
  FacultyAttendanceSession,
  FacultyClass,
  FacultyDashboardData,
  FacultyIntelligence,
  FacultySubject,
} from "@/types/faculty";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
  });
}

function calculateIntelligence(
  subjects: FacultySubject[],
  assignments: FacultyAssignment[],
  attendanceSessions: FacultyAttendanceSession[],
  todayClasses: FacultyClass[],
  upcomingClasses: FacultyClass[],
): FacultyIntelligence {
  const assignedSubjects = subjects.length;

  const totalStudents = subjects.reduce(
    (sum, subject) =>
      sum + subject.studentCount,
    0,
  );

  const totalAssignments =
    assignments.length;

  const now = new Date();

  const upcomingAssignments =
    assignments.filter((assignment) => {
      if (!assignment.dueDate) {
        return false;
      }

      const dueDate = new Date(
        assignment.dueDate,
      );

      return dueDate.getTime() >= now.getTime();
    }).length;

  const attendanceActivityScore =
    attendanceSessions.length === 0
      ? 0
      : clamp(
          attendanceSessions.length * 10,
        );

  const assignmentActivityScore =
    totalAssignments === 0
      ? 0
      : clamp(
          totalAssignments * 10,
        );

  const workloadScore = clamp(
    assignedSubjects * 20 +
      todayClasses.length * 5 +
      upcomingClasses.length * 2,
  );

  const engagementScore =
    totalStudents === 0
      ? 0
      : clamp(
          ((totalAssignments +
            attendanceSessions.length) /
            Math.max(totalStudents, 1)) *
            100,
        );

  const overallScore = Number(
    (
      workloadScore * 0.25 +
      engagementScore * 0.25 +
      attendanceActivityScore * 0.25 +
      assignmentActivityScore * 0.25
    ).toFixed(1),
  );

  const risks: FacultyIntelligence["risks"] =
    [];

  if (
    upcomingAssignments === 0 &&
    assignedSubjects > 0
  ) {
    risks.push({
      key: "assignment_activity",
      level: "moderate",
      title:
        "No upcoming assignment deadlines",
      description:
        "Your currently tracked assignments do not have upcoming deadlines.",
      recommendedAction:
        "Review your subject plans and add assignments where appropriate.",
    });
  }

  const subjectsWithoutAttendance =
    subjects.filter(
      (subject) =>
        subject.attendanceSessionCount ===
        0,
    );

  if (
    subjectsWithoutAttendance.length > 0
  ) {
    risks.push({
      key: "attendance_activity",
      level: "high",
      title:
        "Attendance activity is missing",
      description:
        `${subjectsWithoutAttendance.length} assigned subject(s) have no attendance session recorded.`,
      recommendedAction:
        "Create attendance sessions after conducting classes.",
    });
  }

  if (
    todayClasses.length === 0 &&
    assignedSubjects > 0
  ) {
    risks.push({
      key: "today_schedule",
      level: "low",
      title: "No classes today",
      description:
        "There are no timetable classes assigned to you today.",
      recommendedAction:
        "Use the available time for grading, preparation or student support.",
    });
  }

  const insights: FacultyIntelligence["insights"] =
    [];

  if (assignedSubjects > 0) {
    insights.push({
      type: "positive",
      title: "Faculty profile is active",
      description:
        `You currently teach ${assignedSubjects} subject(s).`,
      href: "/faculty/subjects",
    });
  }

  if (todayClasses.length > 0) {
    insights.push({
      type: "action",
      title: "Classes scheduled today",
      description:
        `${todayClasses.length} class(es) are scheduled today.`,
      href: "/faculty/timetable",
    });
  }

  if (assignments.length > 0) {
    insights.push({
      type: "positive",
      title: "Assignment activity available",
      description:
        `${assignments.length} assignment(s) are currently linked to your faculty profile.`,
      href: "/faculty/assignments",
    });
  }

  if (attendanceSessions.length > 0) {
    insights.push({
      type: "positive",
      title: "Attendance tracking active",
      description:
        `${attendanceSessions.length} attendance session(s) have been recorded.`,
      href: "/faculty/attendance",
    });
  }

  if (risks.length === 0) {
    insights.push({
      type: "info",
      title: "No immediate faculty risks",
      description:
        "CampusMate currently has enough activity data to show a healthy teaching workflow.",
    });
  }

  return {
    workloadScore,
    engagementScore,
    attendanceActivityScore,
    assignmentActivityScore,
    overallScore,

    metrics: {
      assignedSubjects,
      totalStudents,
      totalAssignments,
      upcomingAssignments,
      attendanceSessions:
        attendanceSessions.length,
      classesThisWeek:
        upcomingClasses.length,
    },

    risks,
    insights,

    generatedAt:
      new Date().toISOString(),
  };
}

export async function getFacultyDashboardData(): Promise<FacultyDashboardData> {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      `Unable to load authenticated user: ${userError.message}`,
    );
  }

  if (!user) {
    throw new Error(
      "You must be signed in to access the faculty portal.",
    );
  }

  const {
    data: faculty,
    error: facultyError,
  } = await supabase
    .from("faculty")
    .select(
      `
        id,
        employee_number,
        designation,
        profile_id
      `,
    )
    .eq(
      "profile_id",
      user.id,
    )
    .maybeSingle();

  if (facultyError) {
    throw new Error(
      `Unable to load faculty profile: ${facultyError.message}`,
    );
  }

  if (!faculty) {
    throw new Error(
      "No faculty profile is linked to this account.",
    );
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      `
        id,
        full_name,
        email,
        role
      `,
    )
    .eq(
      "id",
      user.id,
    )
    .maybeSingle();

  if (profileError) {
    throw new Error(
      `Unable to load faculty profile information: ${profileError.message}`,
    );
  }

  if (
    profile?.role !== "faculty" &&
    profile?.role !== "admin"
  ) {
    throw new Error(
      "This account does not have faculty access.",
    );
  }

  const facultyId =
    faculty.id;

  const [
    subjectResult,
    timetableResult,
    assignmentResult,
    attendanceResult,
  ] = await Promise.all([
    supabase
      .from("faculty_subjects")
      .select(
        `
          id,
          subject_id,
          academic_year,
          subjects (
            id,
            code,
            name
          )
        `,
      )
      .eq(
        "faculty_id",
        facultyId,
      ),

    supabase
      .from("timetable_entries")
      .select(
        `
          id,
          subject_id,
          day_of_week,
          start_time,
          end_time,
          room,
          semester_id,
          subjects (
            id,
            code,
            name
          )
        `,
      )
      .eq(
        "faculty_id",
        facultyId,
      ),

    supabase
      .from("assignments")
      .select(
        `
          id,
          title,
          description,
          due_date,
          priority,
          subject_id,
          created_at,
          subjects (
            id,
            code,
            name
          )
        `,
      )
      .eq(
        "faculty_id",
        facultyId,
      )
      .order(
        "due_date",
        {
          ascending: true,
          nullsFirst: false,
        },
      )
      .limit(20),

    supabase
      .from("attendance_sessions")
      .select(
        `
          id,
          subject_id,
          session_date,
          subjects (
            id,
            code,
            name
          )
        `,
      )
      .eq(
        "faculty_id",
        facultyId,
      )
      .order(
        "session_date",
        {
          ascending: false,
        },
      )
      .limit(30),
  ]);

  const firstError =
    subjectResult.error ??
    timetableResult.error ??
    assignmentResult.error ??
    attendanceResult.error;

  if (firstError) {
    throw new Error(
      `Unable to load faculty dashboard: ${firstError.message}`,
    );
  }

  const subjectRows =
    subjectResult.data ?? [];

  const timetableRows =
    timetableResult.data ?? [];

  const assignmentRows =
    assignmentResult.data ?? [];

  const attendanceRows =
    attendanceResult.data ?? [];

  const subjects: FacultySubject[] =
    await Promise.all(
      subjectRows.map(
        async (row) => {
          const subject = Array.isArray(
            row.subjects,
          )
            ? row.subjects[0]
            : row.subjects;

          const studentResult =
            await supabase
              .from("student_subjects")
              .select(
                "student_id",
                {
                  count: "exact",
                  head: true,
                },
              )
              .eq(
                "subject_id",
                row.subject_id,
              );

          const assignmentResult =
            await supabase
              .from("assignments")
              .select(
                "id",
                {
                  count: "exact",
                  head: true,
                },
              )
              .eq(
                "faculty_id",
                facultyId,
              )
              .eq(
                "subject_id",
                row.subject_id,
              );

          const attendanceResult =
            await supabase
              .from(
                "attendance_sessions",
              )
              .select(
                "id",
                {
                  count: "exact",
                  head: true,
                },
              )
              .eq(
                "faculty_id",
                facultyId,
              )
              .eq(
                "subject_id",
                row.subject_id,
              );

          return {
            id: String(row.id),

            subjectId:
              String(row.subject_id),

            subjectCode:
              String(
                subject?.code ?? "",
              ),

            subjectName:
              String(
                subject?.name ??
                  "Unknown subject",
              ),

            academicYear:
              String(
                row.academic_year,
              ),

            studentCount:
              studentResult.count ?? 0,

            assignmentCount:
              assignmentResult.count ??
              0,

            attendanceSessionCount:
              attendanceResult.count ??
              0,
          };
        },
      ),
    );

  const today =
    getDayName(new Date());

  const todayClasses: FacultyClass[] =
    timetableRows
      .filter(
        (row) =>
          String(
            row.day_of_week,
          ).toLowerCase() ===
          today.toLowerCase(),
      )
      .map(
        (row) => {
          const subject =
            Array.isArray(
              row.subjects,
            )
              ? row.subjects[0]
              : row.subjects;

          return {
            id: String(row.id),

            subjectId:
              String(row.subject_id),

            subjectCode:
              String(
                subject?.code ?? "",
              ),

            subjectName:
              String(
                subject?.name ??
                  "Unknown subject",
              ),

            dayOfWeek:
              String(
                row.day_of_week,
              ),

            startTime:
              String(
                row.start_time,
              ),

            endTime:
              String(
                row.end_time,
              ),

            room:
              row.room === null
                ? null
                : String(row.room),

            semesterId:
              String(
                row.semester_id,
              ),
          };
        },
      );

  const upcomingClasses: FacultyClass[] =
    timetableRows.map(
      (row) => {
        const subject =
          Array.isArray(
            row.subjects,
          )
            ? row.subjects[0]
            : row.subjects;

        return {
          id: String(row.id),

          subjectId:
            String(row.subject_id),

          subjectCode:
            String(
              subject?.code ?? "",
            ),

          subjectName:
            String(
              subject?.name ??
                "Unknown subject",
            ),

          dayOfWeek:
            String(
              row.day_of_week,
            ),

          startTime:
            String(
              row.start_time,
            ),

          endTime:
            String(
              row.end_time,
            ),

          room:
            row.room === null
              ? null
              : String(row.room),

          semesterId:
            String(
              row.semester_id,
            ),
        };
      },
    );

  const assignments: FacultyAssignment[] =
    assignmentRows.map(
      (row) => {
        const subject =
          Array.isArray(
            row.subjects,
          )
            ? row.subjects[0]
            : row.subjects;

        return {
          id: String(row.id),

          title:
            String(row.title),

          description:
            row.description === null
              ? null
              : String(
                  row.description,
                ),

          dueDate:
            row.due_date === null
              ? null
              : String(
                  row.due_date,
                ),

          priority:
            String(row.priority),

          subjectId:
            String(row.subject_id),

          subjectCode:
            String(
              subject?.code ?? "",
            ),

          subjectName:
            String(
              subject?.name ??
                "Unknown subject",
            ),

          createdAt:
            String(
              row.created_at,
            ),
        };
      },
    );

  const attendanceSessions: FacultyAttendanceSession[] =
    await Promise.all(
      attendanceRows.map(
        async (row) => {
          const subject =
            Array.isArray(
              row.subjects,
            )
              ? row.subjects[0]
              : row.subjects;

          const {
            data: records,
            error,
          } = await supabase
            .from(
              "attendance_records",
            )
            .select(
              "student_id, status",
            )
            .eq(
              "session_id",
              row.id,
            );

          if (error) {
            throw new Error(
              `Unable to load attendance records: ${error.message}`,
            );
          }

          const recordRows =
            records ?? [];

          const presentCount =
            recordRows.filter(
              (record) =>
                record.status ===
                  "present" ||
                record.status ===
                  "late",
            ).length;

          const absentCount =
            recordRows.filter(
              (record) =>
                record.status ===
                "absent",
            ).length;

          const total =
            presentCount +
            absentCount;

          return {
            id: String(row.id),

            subjectId:
              String(row.subject_id),

            subjectCode:
              String(
                subject?.code ?? "",
              ),

            subjectName:
              String(
                subject?.name ??
                  "Unknown subject",
              ),

            sessionDate:
              String(
                row.session_date,
              ),

            studentCount:
              total,

            presentCount,

            absentCount,

            attendancePercentage:
              total > 0
                ? Number(
                    (
                      (presentCount /
                        total) *
                      100
                    ).toFixed(1),
                  )
                : 0,
          };
        },
      ),
    );

  const intelligence =
    calculateIntelligence(
      subjects,
      assignments,
      attendanceSessions,
      todayClasses,
      upcomingClasses,
    );

  return {
    faculty: {
      id: facultyId,

      employeeNumber:
        String(
          faculty.employee_number,
        ),

      designation:
        faculty.designation === null
          ? null
          : String(
              faculty.designation,
            ),

      name:
        String(
          profile?.full_name ??
            "Faculty",
        ),

      email:
        String(
          profile?.email ??
            user.email ??
            "",
        ),
    },

    subjects,

    todayClasses,

    upcomingClasses,

    assignments,

    attendanceSessions,

    intelligence,

    generatedAt:
      new Date().toISOString(),
  };
}