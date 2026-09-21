"use server";

import { createClient } from "@/lib/supabase/server";

import type {
  AcademicAnalyticsData,
  AcademicInsight,
  AcademicRisk,
  AcademicRiskLevel,
  AnalyticsMetric,
  AnalyticsTrend,
  AttendanceAnalytics,
  AssignmentAnalytics,
  ExamAnalytics,
  StudyAnalytics,
  SubjectAnalytics,
} from "@/types/academic-analytics";

type StudentSubjectRow = {
  subject_id: string;
};

type SubjectRow = {
  id: string;
  code: string;
  name: string;
};

type AttendanceRecordRow = {
  attendance_session_id: string;
  status: string;
};

type AttendanceSessionRow = {
  id: string;
  subject_id: string;
  session_date: string;
};

type AssignmentRow = {
  id: string;
  subject_id: string;
  due_date: string | null;
};

type AssignmentStatusRow = {
  assignment_id: string;
  status: string;
};

type ProgressRow = {
  subject_id: string;
  progress_percentage: number | null;
};

type StudyPlanItemRow = {
  id: string;
  study_plan_id: string;
  completed: boolean;
};

type StudyPlanRow = {
  id: string;
  student_id: string;
};

type FocusSessionRow = {
  duration_minutes: number | null;
  started_at: string;
};

type ExamRow = {
  id: string;
  subject_id: string;
  exam_type: string;
  exam_date: string;
};

function clamp(
  value: number,
  min = 0,
  max = 100,
): number {
  return Math.min(
    max,
    Math.max(min, value),
  );
}

function getTrend(
  current: number,
  previous: number | null,
): AnalyticsTrend {
  if (previous === null) {
    return "insufficient_data";
  }

  const difference =
    current - previous;

  if (difference >= 5) {
    return "improving";
  }

  if (difference <= -5) {
    return "declining";
  }

  return "stable";
}

function createMetric(
  current: number,
  previous: number | null,
): AnalyticsMetric {
  return {
    current,
    previous,
    change:
      previous === null
        ? null
        : Number(
            (
              current - previous
            ).toFixed(1),
          ),
    trend: getTrend(
      current,
      previous,
    ),
  };
}

function riskFromScore(
  score: number,
): AcademicRiskLevel {
  if (score < 40) {
    return "critical";
  }

  if (score < 60) {
    return "high";
  }

  if (score < 75) {
    return "moderate";
  }

  return "low";
}

export async function getAcademicAnalyticsData(): Promise<AcademicAnalyticsData> {
  const supabase = await createClient();

  // ============================================================
  // 1. AUTHENTICATION
  // ============================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  // ============================================================
  // 2. STUDENT
  // ============================================================

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (studentError) {
    throw new Error(
      studentError.message,
    );
  }

  if (!student) {
    throw new Error(
      "Student profile was not found.",
    );
  }

  // ============================================================
  // 3. STUDENT SUBJECTS
  // ============================================================

  const {
    data: studentSubjects,
    error: studentSubjectsError,
  } = await supabase
    .from("student_subjects")
    .select("subject_id")
    .eq(
      "student_id",
      student.id,
    );

  if (studentSubjectsError) {
    throw new Error(
      studentSubjectsError.message,
    );
  }

  const subjectIds: string[] =
    (studentSubjects ?? []).map(
      (row: StudentSubjectRow) =>
        row.subject_id,
    );

  // ============================================================
  // 4. SUBJECTS
  // ============================================================

  let subjects: SubjectRow[] = [];

  if (subjectIds.length > 0) {
    const {
      data: subjectRows,
      error: subjectError,
    } = await supabase
      .from("subjects")
      .select("id, code, name")
      .in("id", subjectIds);

    if (subjectError) {
      throw new Error(
        subjectError.message,
      );
    }

    subjects = (subjectRows ?? []).map(
      (row: SubjectRow) => ({
        id: row.id,
        code: row.code,
        name: row.name,
      }),
    );
  }

  // ============================================================
  // 5. ATTENDANCE SESSIONS
  // ============================================================

  const {
    data: attendanceSessions,
    error: attendanceSessionError,
  } = await supabase
    .from("attendance_sessions")
    .select(
      "id, subject_id, session_date",
    )
    .in(
      "subject_id",
      subjectIds.length > 0
        ? subjectIds
        : [
            "00000000-0000-0000-0000-000000000000",
          ],
    );

  if (attendanceSessionError) {
    throw new Error(
      attendanceSessionError.message,
    );
  }

  const sessions: AttendanceSessionRow[] =
    (attendanceSessions ?? []).map(
      (
        session: AttendanceSessionRow,
      ) => ({
        id: session.id,
        subject_id:
          session.subject_id,
        session_date:
          session.session_date,
      }),
    );

// ============================================================
// 6. ATTENDANCE RECORDS
// ============================================================

const sessionIds =
  sessions.map(
    (session) => session.id,
  );

let attendanceRecords: AttendanceRecordRow[] =
  [];

if (sessionIds.length > 0) {
  const {
    data: records,
    error: recordError,
  } = await supabase
    .from("attendance_records")
    .select(
      "session_id, status",
    )
    .in(
      "session_id",
      sessionIds,
    )
    .returns<
      {
        session_id: string;
        status: string | null;
      }[]
    >();

  if (recordError) {
    throw new Error(
      `Failed to load attendance records: ${recordError.message}`,
    );
  }

  attendanceRecords =
    (records ?? []).map(
      (record) => ({
        attendance_session_id:
          String(
            record.session_id,
          ),

        status:
          record.status === null
            ? ""
            : String(
                record.status,
              ),
      }),
    );
}

  // ============================================================
  // 7. ATTENDANCE CALCULATION
  // ============================================================

  const presentRecords =
    attendanceRecords.filter(
      (record) =>
        record.status ===
          "present" ||
        record.status ===
          "late",
    ).length;

  const totalAttendance =
    attendanceRecords.length;

  const attendancePercentage =
    totalAttendance > 0
      ? clamp(
          (presentRecords /
            totalAttendance) *
            100,
        )
      : 0;

  const attendanceMetric =
    createMetric(
      attendancePercentage,
      null,
    );

  const attendanceTrend =
    sessions
      .slice()
      .sort(
        (a, b) =>
          new Date(
            a.session_date,
          ).getTime() -
          new Date(
            b.session_date,
          ).getTime(),
      )
      .reduce<
        Array<{
          month: string;
          percentage: number;
        }>
      >(
        (
          result,
          session,
        ) => {
          const month =
            session.session_date.slice(
              0,
              7,
            );

          const record =
            attendanceRecords.find(
              (item) =>
                item.attendance_session_id ===
                session.id,
            );

          if (!record) {
            return result;
          }

          let monthEntry =
            result.find(
              (item) =>
                item.month ===
                month,
            );

          if (!monthEntry) {
            monthEntry = {
              month,
              percentage: 0,
            };

            result.push(
              monthEntry,
            );
          }

          const existing =
            monthEntry.percentage;

          monthEntry.percentage =
            record.status ===
              "present" ||
            record.status ===
              "late"
              ? existing + 1
              : existing;

          return result;
        },
        [],
      );

  const attendance: AttendanceAnalytics =
    {
      overall:
        Number(
          attendancePercentage.toFixed(
            1,
          ),
        ),

      attended:
        presentRecords,

      total:
        totalAttendance,

      metric:
        attendanceMetric,

      monthlyTrend:
        attendanceTrend,
    };

  // ============================================================
  // 8. ASSIGNMENTS
  // ============================================================

  let assignments: AssignmentRow[] =
    [];

  if (subjectIds.length > 0) {
    const {
      data: assignmentRows,
      error: assignmentError,
    } = await supabase
      .from("assignments")
      .select(
        "id, subject_id, due_date",
      )
      .in(
        "subject_id",
        subjectIds,
      );

    if (assignmentError) {
      throw new Error(
        assignmentError.message,
      );
    }

    assignments =
      (assignmentRows ?? []).map(
        (assignment: AssignmentRow) => ({
          id: assignment.id,
          subject_id:
            assignment.subject_id,
          due_date:
            assignment.due_date,
        }),
      );
  }

  const assignmentIds =
    assignments.map(
      (assignment) =>
        assignment.id,
    );

  let assignmentStatuses: AssignmentStatusRow[] =
    [];

  if (assignmentIds.length > 0) {
    const {
      data: statusRows,
      error: statusError,
    } = await supabase
      .from("assignment_status")
      .select(
        "assignment_id, status",
      )
      .eq(
        "student_id",
        student.id,
      )
      .in(
        "assignment_id",
        assignmentIds,
      );

    if (statusError) {
      throw new Error(
        statusError.message,
      );
    }

    assignmentStatuses =
      (statusRows ?? []).map(
        (status: AssignmentStatusRow) => ({
          assignment_id:
            status.assignment_id,
          status: String(
            status.status,
          ),
        }),
      );
  }

  const completedAssignments =
    assignmentStatuses.filter(
      (item) =>
        item.status ===
        "completed",
    ).length;

  const today =
    new Date();

  const overdueAssignments =
    assignments.filter(
      (assignment) => {
        if (!assignment.due_date) {
          return false;
        }

        const status =
          assignmentStatuses.find(
            (item) =>
              item.assignment_id ===
              assignment.id,
          );

        if (
          status?.status ===
          "completed"
        ) {
          return false;
        }

        return (
          new Date(
            assignment.due_date,
          ).getTime() <
          today.getTime()
        );
      },
    ).length;

  const pendingAssignments =
    Math.max(
      0,
      assignments.length -
        completedAssignments,
    );

  const assignmentCompletionRate =
    assignments.length > 0
      ? clamp(
          (completedAssignments /
            assignments.length) *
            100,
        )
      : 0;

  const assignmentAnalytics: AssignmentAnalytics =
    {
      total:
        assignments.length,

      completed:
        completedAssignments,

      pending:
        pendingAssignments,

      overdue:
        overdueAssignments,

      completionRate:
        Number(
          assignmentCompletionRate.toFixed(
            1,
          ),
        ),

      metric:
        createMetric(
          assignmentCompletionRate,
          null,
        ),
    };

  // ============================================================
// 9. STUDY PLANS
// ============================================================

const {
  data: studyPlans,
  error: studyPlanError,
} = await supabase
  .from("study_plans")
  .select("id, student_id")
  .eq("student_id", student.id);

if (studyPlanError) {
  throw new Error(
    `Failed to load study plans: ${studyPlanError.message}`,
  );
}

const planRows: StudyPlanRow[] =
  (studyPlans ?? []).map((plan) => ({
    id: String(plan.id),
    student_id: String(plan.student_id),
  }));

const planIds = planRows.map(
  (plan) => plan.id,
);

let studyItems: StudyPlanItemRow[] = [];

if (planIds.length > 0) {
  const {
    data: itemRows,
    error: itemError,
  } = await supabase
    .from("study_plan_items")
    .select(
      "id, study_plan_id, completed",
    )
    .in("study_plan_id", planIds)
    .returns<
      {
        id: string;
        study_plan_id: string;
        completed: boolean | null;
      }[]
    >();

  if (itemError) {
    throw new Error(
      `Failed to load study plan items: ${itemError.message}`,
    );
  }

  studyItems = (itemRows ?? []).map(
    (item) => ({
      id: String(item.id),
      study_plan_id: String(
        item.study_plan_id,
      ),
      completed:
        item.completed === true,
    }),
  );
}
  // ============================================================
  // 10. FOCUS SESSIONS
  // ============================================================

  const {
    data: focusRows,
    error: focusError,
  } = await supabase
    .from("focus_sessions")
    .select(
      "duration_minutes, started_at",
    )
    .eq(
      "student_id",
      student.id,
    );

  if (focusError) {
    throw new Error(
      focusError.message,
    );
  }

  const focusSessions: FocusSessionRow[] =
    (focusRows ?? []).map(
      (
        session: FocusSessionRow,
      ) => ({
        duration_minutes:
          session.duration_minutes,
        started_at:
          session.started_at,
      }),
    );

  const totalStudyMinutes =
    focusSessions.reduce(
      (total, session) =>
        total +
        (session.duration_minutes ??
          0),
      0,
    );

  const studyDays =
    new Set(
      focusSessions.map(
        (session) =>
          session.started_at.slice(
            0,
            10,
          ),
      ),
    );

  const studyTaskCount =
    studyItems.length;

  const completedStudyTasks =
    studyItems.filter(
      (item) =>
        item.completed,
    ).length;

  const studyCompletionRate =
    studyTaskCount > 0
      ? clamp(
          (completedStudyTasks /
            studyTaskCount) *
            100,
        )
      : 0;

  const studyAnalytics: StudyAnalytics =
    {
      totalMinutes:
        totalStudyMinutes,

      averageDailyMinutes:
        studyDays.size > 0
          ? Number(
              (
                totalStudyMinutes /
                studyDays.size
              ).toFixed(1),
            )
          : 0,

      activeDays:
        studyDays.size,

      completedTasks:
        completedStudyTasks,

      totalTasks:
        studyTaskCount,

      completionRate:
        Number(
          studyCompletionRate.toFixed(
            1,
          ),
        ),

      metric:
        createMetric(
          studyCompletionRate,
          null,
        ),
    };

  // ============================================================
  // 11. SYLLABUS / SUBJECT PROGRESS
  // ============================================================

  let progressRows: ProgressRow[] =
    [];

  if (subjectIds.length > 0) {
    const {
      data: progress,
      error: progressError,
    } = await supabase
      .from(
        "student_subject_progress",
      )
      .select(
        "subject_id, progress_percentage",
      )
      .eq(
        "student_id",
        student.id,
      )
      .in(
        "subject_id",
        subjectIds,
      );

    if (progressError) {
      throw new Error(
        progressError.message,
      );
    }

    progressRows =
      (progress ?? []).map(
        (row: ProgressRow) => ({
          subject_id:
            row.subject_id,
          progress_percentage:
            row.progress_percentage,
        }),
      );
  }

  // ============================================================
  // 12. EXAMS
  // ============================================================

  let exams: ExamRow[] = [];

  if (subjectIds.length > 0) {
    const {
      data: examRows,
      error: examError,
    } = await supabase
      .from("exams")
      .select(
        "id, subject_id, exam_type, exam_date",
      )
      .in(
        "subject_id",
        subjectIds,
      )
      .order(
        "exam_date",
        {
          ascending: true,
        },
      );

    if (examError) {
      throw new Error(
        examError.message,
      );
    }

    exams =
      (examRows ?? []).map(
        (exam: ExamRow) => ({
          id: exam.id,
          subject_id:
            exam.subject_id,
          exam_type:
            exam.exam_type,
          exam_date:
            exam.exam_date,
        }),
      );
  }

  const currentTime =
    Date.now();

  const upcomingExams =
    exams.filter(
      (exam) =>
        new Date(
          exam.exam_date,
        ).getTime() >=
        currentTime,
    );

  const completedExams =
    exams.filter(
      (exam) =>
        new Date(
          exam.exam_date,
        ).getTime() <
        currentTime,
    );

  const averageProgress =
    progressRows.length > 0
      ? progressRows.reduce(
          (sum, item) =>
            sum +
            (item.progress_percentage ??
              0),
          0,
        ) /
        progressRows.length
      : 0;

  const examPreparationScore =
    clamp(
      attendancePercentage *
        0.25 +
        assignmentCompletionRate *
          0.2 +
        studyCompletionRate *
          0.25 +
        averageProgress *
          0.3,
    );

  const examAnalytics: ExamAnalytics =
    {
      totalExams:
        exams.length,

      upcomingExams:
        upcomingExams.length,

      completedExams:
        completedExams.length,

      averageDaysToExam:
        upcomingExams.length > 0
          ? Number(
              (
                upcomingExams.reduce(
                  (sum, exam) =>
                    sum +
                    Math.max(
                      0,
                      Math.ceil(
                        (
                          new Date(
                            exam.exam_date,
                          ).getTime() -
                          currentTime
                        ) /
                          (1000 *
                            60 *
                            60 *
                            24),
                      ),
                    ),
                  0,
                ) /
                upcomingExams.length
              ).toFixed(1),
            )
          : null,

      preparationScore:
        Number(
          examPreparationScore.toFixed(
            1,
          ),
        ),

      exams: upcomingExams.map(
        (exam) => {
          const subject =
            subjects.find(
              (item) =>
                item.id ===
                exam.subject_id,
            );

          return {
            id: exam.id,

            subjectId:
              exam.subject_id,

            subjectName:
              subject?.name ??
              "Unknown subject",

            examType:
              exam.exam_type,

            examDate:
              exam.exam_date,

            preparationScore:
              Number(
                examPreparationScore.toFixed(
                  1,
                ),
              ),
          };
        },
      ),
    };

  // ============================================================
  // 13. SUBJECT ANALYTICS
  // ============================================================

  const subjectAnalytics: SubjectAnalytics[] =
    subjects.map(
      (subject) => {
        const subjectSessions =
          sessions.filter(
            (session) =>
              session.subject_id ===
              subject.id,
          );

        const subjectSessionIds =
          new Set(
            subjectSessions.map(
              (session) =>
                session.id,
            ),
          );

        const subjectAttendanceRecords =
          attendanceRecords.filter(
            (record) =>
              subjectSessionIds.has(
                record.attendance_session_id,
              ),
          );

        const subjectPresent =
          subjectAttendanceRecords.filter(
            (record) =>
              record.status ===
                "present" ||
              record.status ===
                "late",
          ).length;

        const subjectAttendance =
          subjectAttendanceRecords.length >
          0
            ? clamp(
                (subjectPresent /
                  subjectAttendanceRecords.length) *
                  100,
              )
            : null;

        const subjectAssignments =
          assignments.filter(
            (assignment) =>
              assignment.subject_id ===
              subject.id,
          );

        const subjectAssignmentIds =
          new Set(
            subjectAssignments.map(
              (assignment) =>
                assignment.id,
            ),
          );

        const subjectCompleted =
          assignmentStatuses.filter(
            (status) =>
              subjectAssignmentIds.has(
                status.assignment_id,
              ) &&
              status.status ===
                "completed",
          ).length;

        const subjectAssignmentCompletion =
          subjectAssignments.length >
          0
            ? clamp(
                (subjectCompleted /
                  subjectAssignments.length) *
                  100,
              )
            : null;

        const subjectProgress =
          progressRows.find(
            (progress) =>
              progress.subject_id ===
              subject.id,
          );

        const syllabusProgress =
          subjectProgress
            ?.progress_percentage ??
          null;

        const scoreComponents =
          [
            subjectAttendance ??
              0,
            subjectAssignmentCompletion ??
              0,
            syllabusProgress ??
              0,
            studyCompletionRate,
            examPreparationScore,
          ];

        const performanceScore =
          Number(
            (
              scoreComponents.reduce(
                (sum, value) =>
                  sum + value,
                0,
              ) /
              scoreComponents.length
            ).toFixed(1),
          );

        return {
          subjectId:
            subject.id,

          subjectCode:
            subject.code,

          subjectName:
            subject.name,

          attendance:
            subjectAttendance ===
            null
              ? null
              : Number(
                  subjectAttendance.toFixed(
                    1,
                  ),
                ),

          assignmentCompletion:
            subjectAssignmentCompletion ===
            null
              ? null
              : Number(
                  subjectAssignmentCompletion.toFixed(
                    1,
                  ),
                ),

          studyMinutes:
            totalStudyMinutes,

          syllabusProgress:
            syllabusProgress ===
            null
              ? null
              : Number(
                  syllabusProgress.toFixed(
                    1,
                  ),
                ),

          examReadiness:
            Number(
              examPreparationScore.toFixed(
                1,
              ),
            ),

          performanceScore,

          trend:
            getTrend(
              performanceScore,
              null,
            ),

          riskLevel:
            riskFromScore(
              performanceScore,
            ),
        };
      },
    );

  // ============================================================
  // 14. OVERALL SCORE
  // ============================================================

  const averageSubjectScore =
    subjectAnalytics.length > 0
      ? subjectAnalytics.reduce(
          (sum, subject) =>
            sum +
            subject.performanceScore,
          0,
        ) /
        subjectAnalytics.length
      : 0;

  const overallScore =
    Number(
      clamp(
        averageSubjectScore *
          0.4 +
          attendancePercentage *
            0.2 +
          assignmentCompletionRate *
            0.15 +
          studyCompletionRate *
            0.1 +
          examPreparationScore *
            0.15,
      ).toFixed(1),
    );

  // ============================================================
  // 15. RISKS
  // ============================================================

  const risks: AcademicRisk[] =
    [];

  if (
    attendancePercentage <
    75
  ) {
    risks.push({
      key: "attendance",

      level:
        attendancePercentage <
        60
          ? "critical"
          : "high",

      title:
        "Attendance needs attention",

      description:
        `Your current attendance is ${attendancePercentage.toFixed(
          1,
        )}%.`,

      metric:
        attendancePercentage,

      recommendedAction:
        "Attend upcoming classes consistently and prioritize subjects below the attendance requirement.",
    });
  }

  if (
    assignmentCompletionRate <
    70
  ) {
    risks.push({
      key: "assignments",

      level:
        assignmentCompletionRate <
        40
          ? "critical"
          : "high",

      title:
        "Assignment completion is low",

      description:
        `${overdueAssignments} assignment(s) are currently overdue.`,

      metric:
        assignmentCompletionRate,

      recommendedAction:
        "Complete overdue assignments first, then work through upcoming deadlines.",
    });
  }

  if (
    studyCompletionRate <
    60
  ) {
    risks.push({
      key: "study",

      level:
        studyCompletionRate <
        30
          ? "high"
          : "moderate",

      title:
        "Study consistency can improve",

      description:
        "Your study-plan completion rate is below the target level.",

      metric:
        studyCompletionRate,

      recommendedAction:
        "Create shorter daily study sessions and complete them consistently.",
    });
  }

  if (
    examPreparationScore <
      60 &&
    upcomingExams.length > 0
  ) {
    risks.push({
      key: "exam_preparation",

      level:
        examPreparationScore <
        40
          ? "critical"
          : "high",

      title:
        "Exam preparation needs attention",

      description:
        `${upcomingExams.length} upcoming exam(s) require preparation.`,

      metric:
        examPreparationScore,

      recommendedAction:
        "Prioritize the nearest exam and create a focused revision plan.",
    });
  }

  // ============================================================
  // 16. INSIGHTS
  // ============================================================

  const insights: AcademicInsight[] =
    [];

  if (
    attendancePercentage >=
    85
  ) {
    insights.push({
      type: "positive",

      title:
        "Attendance is strong",

      description:
        "Your attendance is currently supporting a healthy academic routine.",

      href: "/attendance",
    });
  }

  if (
    assignmentCompletionRate >=
    85
  ) {
    insights.push({
      type: "positive",

      title:
        "Assignment completion is strong",

      description:
        "You are consistently completing your academic tasks.",

      href: "/assignments",
    });
  }

  if (
    upcomingExams.length > 0
  ) {
    insights.push({
      type: "action",

      title:
        "Keep exam preparation active",

      description:
        `You have ${upcomingExams.length} upcoming exam(s).`,

      href: "/exams",
    });
  }

  if (
    risks.length === 0
  ) {
    insights.push({
      type: "positive",

      title:
        "No major academic risks detected",

      description:
        "Your current academic indicators are within healthy ranges.",
    });
  }

  if (
    insights.length === 0
  ) {
    insights.push({
      type: "info",

      title:
        "Keep building your academic history",

      description:
        "More attendance, study and assignment activity will make CampusMate's analytics more accurate.",
    });
  }

  // ============================================================
  // 17. STRONGEST / WEAKEST SUBJECTS
  // ============================================================

  const sortedSubjects =
    [...subjectAnalytics].sort(
      (a, b) =>
        b.performanceScore -
        a.performanceScore,
    );

  const strongestSubjects =
    sortedSubjects.slice(
      0,
      3,
    );

  const weakestSubjects =
    [...sortedSubjects]
      .reverse()
      .slice(
        0,
        3,
      );

  // ============================================================
  // 18. FINAL RESULT
  // ============================================================

  return {
    generatedAt:
      new Date().toISOString(),

    overallScore,

    overallTrend:
      "insufficient_data",

    attendance,

    assignments:
      assignmentAnalytics,

    study:
      studyAnalytics,

    subjects:
      subjectAnalytics,

    exams:
      examAnalytics,

    risks,

    insights,

    strongestSubjects,

    weakestSubjects,
  };
}