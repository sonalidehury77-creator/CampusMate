import { createClient } from "@/lib/supabase/server";

import type {
  AcademicHealthData,
  AcademicRisk,
  SubjectHealth,
} from "@/types/academic-health";

import {
  calculateAssignmentScore,
  calculateAttendanceScore,
  calculateExamReadiness,
  calculateOverallScore,
  calculateSyllabusScore,
  calculateStudyScore,
  createAssignmentRisk,
  createAttendanceRisk,
  createHealthMetric,
  createRecommendations,
  createSyllabusRisk,
  getHealthLevel,
} from "./academic-health-calculator";

type SubjectRecord = {
  id: string;
  code: string;
  name: string;
  credits: number | null;
};

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  );
}

export async function getAcademicHealthData(): Promise<AcademicHealthData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select(
        `
          id,
          profile_id,
          semester_id
        `,
      )
      .eq("profile_id", user.id)
      .maybeSingle();

  if (studentError) {
    throw new Error(
      `Unable to load student profile: ${studentError.message}`,
    );
  }

  if (!student) {
    throw new Error(
      "Student onboarding is incomplete.",
    );
  }

  const {
    data: enrollments,
    error: enrollmentError,
  } = await supabase
    .from("student_subjects")
    .select(
      `
        subject_id,
        subjects (
          id,
          code,
          name,
          credits
        )
      `,
    )
    .eq("student_id", student.id);

  if (enrollmentError) {
    throw new Error(
      `Unable to load subjects: ${enrollmentError.message}`,
    );
  }

  const subjects: SubjectRecord[] =
    (enrollments ?? [])
      .map((row) => {
        const subject = Array.isArray(row.subjects)
          ? row.subjects[0]
          : row.subjects;

        if (!subject) {
          return null;
        }

        return subject as SubjectRecord;
      })
      .filter(
        (subject): subject is SubjectRecord =>
          subject !== null,
      );

  const subjectIds = subjects.map(
    (subject) => subject.id,
  );

  if (subjectIds.length === 0) {
    return createEmptyAcademicHealth();
  }

  const [
    progressResult,
    assignmentsResult,
    attendanceSessionsResult,
    attendanceRecordsResult,
    studyPlansResult,
    studyItemsResult,
  ] = await Promise.all([
    supabase
      .from("student_subject_progress")
      .select(
        `
          subject_id,
          progress_percentage
        `,
      )
      .eq("student_id", student.id)
      .in("subject_id", subjectIds),

    supabase
      .from("assignments")
      .select(
        `
          id,
          subject_id,
          due_date
        `,
      )
      .in("subject_id", subjectIds),

    supabase
      .from("attendance_sessions")
      .select(
        `
          id,
          subject_id,
          session_date
        `,
      )
      .in("subject_id", subjectIds),

    supabase
      .from("attendance_records")
      .select(
        `
          session_id,
          status,
          student_id
        `,
      )
      .eq("student_id", student.id),

    supabase
      .from("study_plans")
      .select(
        `
          id,
          subject_id
        `,
      )
      .eq("student_id", student.id),

    supabase
      .from("study_plan_items")
      .select(
        `
          study_plan_id,
          subject_id,
          duration_minutes,
          status,
          completed_at
        `,
      ),
  ]);

  const firstError = [
    progressResult.error,
    assignmentsResult.error,
    attendanceSessionsResult.error,
    attendanceRecordsResult.error,
    studyPlansResult.error,
    studyItemsResult.error,
  ].find(Boolean);

  if (firstError) {
    throw new Error(
      `Unable to calculate academic health: ${firstError.message}`,
    );
  }

  const progressRows =
    progressResult.data ?? [];

  const assignmentRows =
    assignmentsResult.data ?? [];

  const attendanceSessions =
    attendanceSessionsResult.data ?? [];

  const attendanceRecords =
    attendanceRecordsResult.data ?? [];

  const studyItems =
    studyItemsResult.data ?? [];

  /*
   * study_plan_items belongs to a study_plan.
   * The study_plan itself contains subject_id.
   *
   * Therefore we build:
   *
   * study_plan_id -> subject_id
   *
   * This allows us to correctly calculate
   * study activity for each subject.
   */
  const studyPlans =
    studyPlansResult.data ?? [];

  const studyPlanSubjectMap =
    new Map<string, string | null>();

  for (const plan of studyPlans) {
    studyPlanSubjectMap.set(
      plan.id,
      plan.subject_id,
    );
  }

  const today = new Date();

  const subjectHealth: SubjectHealth[] =
    subjects.map((subject) => {
      /*
       * -----------------------------
       * SYLLABUS / PROGRESS
       * -----------------------------
       */

      const progressRow =
        progressRows.find(
          (row) =>
            row.subject_id === subject.id,
        );

      const progress =
        Number(
          progressRow?.progress_percentage ?? 0,
        );

      /*
       * -----------------------------
       * ASSIGNMENTS
       * -----------------------------
       */

      const subjectAssignments =
        assignmentRows.filter(
          (assignment) =>
            assignment.subject_id ===
            subject.id,
        );

      const overdueAssignments =
        subjectAssignments.filter(
          (assignment) =>
            assignment.due_date &&
            new Date(assignment.due_date) <
              today,
        ).length;

      /*
       * At this stage the database does not
       * provide the student's assignment_status
       * information in this service.
       *
       * Therefore we keep the existing
       * conservative calculation:
       *
       * total assignments - overdue assignments
       *
       * This should be replaced by actual
       * assignment_status records when that
       * module is extended with per-student
       * completion data.
       */
      const completedAssignments =
        Math.max(
          0,
          subjectAssignments.length -
            overdueAssignments,
        );

      /*
       * -----------------------------
       * ATTENDANCE
       * -----------------------------
       */

      const subjectSessions =
        attendanceSessions.filter(
          (session) =>
            session.subject_id ===
            subject.id,
        );

      const sessionIds = new Set(
        subjectSessions.map(
          (session) => session.id,
        ),
      );

      const subjectAttendance =
        attendanceRecords.filter(
          (record) =>
            sessionIds.has(
              record.session_id,
            ),
        );

      const present =
        subjectAttendance.filter(
          (record) =>
            record.status === "present",
        ).length;

      const absent =
        subjectAttendance.filter(
          (record) =>
            record.status === "absent",
        ).length;

      const attendancePercentage =
        present + absent > 0
          ? (present /
              (present + absent)) *
            100
          : 100;

      /*
       * -----------------------------
       * STUDY ACTIVITY
       * -----------------------------
       */

      const subjectStudyItems =
        studyItems.filter((item) => {
          const planSubjectId =
            studyPlanSubjectMap.get(
              item.study_plan_id,
            );

          return (
            planSubjectId === subject.id ||
            item.subject_id === subject.id
          );
        });

      const plannedMinutes =
        subjectStudyItems.reduce(
          (sum, item) =>
            sum +
            Number(
              item.duration_minutes ?? 0,
            ),
          0,
        );

      const completedMinutes =
        subjectStudyItems
          .filter(
            (item) =>
              item.status === "completed" ||
              item.completed_at !== null,
          )
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item.duration_minutes ?? 0,
              ),
            0,
          );

      /*
       * -----------------------------
       * HEALTH SCORES
       * -----------------------------
       */

      const attendanceScore =
        calculateAttendanceScore(
          attendancePercentage,
        );

      const syllabusScore =
        calculateSyllabusScore(progress);

      const assignmentScore =
        calculateAssignmentScore(
          subjectAssignments.length,
          completedAssignments,
          overdueAssignments,
        );

      const studyScore =
        calculateStudyScore(
          plannedMinutes,
          completedMinutes,
        );

      const examReadiness =
        calculateExamReadiness(
          progress,
          studyScore,
        );

      const overallScore =
        calculateOverallScore(
          attendanceScore,
          assignmentScore,
          syllabusScore,
          studyScore,
          examReadiness,
        );

      return {
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,

        overallScore,

        level: getHealthLevel(
          overallScore,
        ),

        attendance: createHealthMetric(
          attendanceScore,
          "Attendance",
          `${attendancePercentage.toFixed(
            1,
          )}% attendance`,
        ),

        syllabus: createHealthMetric(
          syllabusScore,
          "Syllabus",
          `${progress}% tracked progress`,
        ),

        assignments: createHealthMetric(
          assignmentScore,
          "Assignments",
          `${completedAssignments}/${subjectAssignments.length} completed`,
        ),

        study: createHealthMetric(
          studyScore,
          "Study",
          `${completedMinutes} of ${plannedMinutes} planned minutes`,
        ),

        progress,

        pendingAssignments:
          Math.max(
            0,
            subjectAssignments.length -
              completedAssignments,
          ),

        overdueAssignments,

        attendancePercentage,

        recommendation:
          attendancePercentage < 75
            ? "Prioritize attendance."
            : overdueAssignments > 0
              ? "Complete overdue work."
              : progress < 60
                ? "Increase syllabus coverage."
                : "Maintain your current study routine.",
      };
    });

  /*
   * -----------------------------
   * OVERALL HEALTH
   * -----------------------------
   */

  const attendanceScore = average(
    subjectHealth.map(
      (subject) =>
        subject.attendance.score,
    ),
  );

  const assignmentScore = average(
    subjectHealth.map(
      (subject) =>
        subject.assignments.score,
    ),
  );

  const syllabusScore = average(
    subjectHealth.map(
      (subject) =>
        subject.syllabus.score,
    ),
  );

  const studyScore = average(
    subjectHealth.map(
      (subject) =>
        subject.study.score,
    ),
  );

  const examReadiness =
    calculateExamReadiness(
      syllabusScore,
      studyScore,
    );

  const overallScore =
    calculateOverallScore(
      attendanceScore,
      assignmentScore,
      syllabusScore,
      studyScore,
      examReadiness,
    );

  /*
   * -----------------------------
   * RISKS
   * -----------------------------
   */

  const risks: AcademicRisk[] = [];

  for (const subject of subjectHealth) {
    const attendanceRisk =
      createAttendanceRisk(
        subject.subjectName,
        subject.attendancePercentage,
      );

    if (attendanceRisk) {
      risks.push(attendanceRisk);
    }

    const assignmentRisk =
      createAssignmentRisk(
        subject.subjectName,
        subject.overdueAssignments,
      );

    if (assignmentRisk) {
      risks.push(assignmentRisk);
    }

    const syllabusRisk =
      createSyllabusRisk(
        subject.subjectName,
        subject.progress,
      );

    if (syllabusRisk) {
      risks.push(syllabusRisk);
    }
  }

  /*
   * -----------------------------
   * RECOMMENDATIONS
   * -----------------------------
   */

  const recommendations =
    createRecommendations(risks);

  /*
   * -----------------------------
   * SUMMARY
   * -----------------------------
   */

  const summary =
    createAcademicSummary(
      overallScore,
      subjectHealth,
      risks,
    );

  return {
    overallScore,

    overallLevel:
      getHealthLevel(overallScore),

    attendance: createHealthMetric(
      attendanceScore,
      "Attendance Health",
      "Based on your recorded present and absent classes.",
    ),

    assignments: createHealthMetric(
      assignmentScore,
      "Assignment Health",
      "Based on completion and overdue work.",
    ),

    syllabus: createHealthMetric(
      syllabusScore,
      "Syllabus Health",
      "Based on your recorded subject progress.",
    ),

    studyConsistency: createHealthMetric(
      studyScore,
      "Study Consistency",
      "Based on completed study-planner time.",
    ),

    examReadiness: createHealthMetric(
      examReadiness,
      "Exam Readiness",
      "Estimated from syllabus progress and study consistency.",
    ),

    subjects: subjectHealth,

    risks: risks.slice(0, 10),

    recommendations:
      recommendations.slice(0, 10),

    trend: [
      {
        label: "Current",
        score: overallScore,
      },
    ],

    summary,

    generatedAt:
      new Date().toISOString(),
  };
}

function createAcademicSummary(
  score: number,
  subjects: SubjectHealth[],
  risks: AcademicRisk[],
): string {
  if (subjects.length === 0) {
    return "Start adding your academic data to receive personalized academic insights.";
  }

  const weakestSubject =
    [...subjects].sort(
      (a, b) =>
        a.overallScore -
        b.overallScore,
    )[0];

  if (risks.length === 0) {
    return `Your academic health is currently ${score}/100. Your tracked academic areas do not show major risks. Continue your current study routine and keep monitoring your progress.`;
  }

  return `Your academic health is currently ${score}/100. Your main area requiring attention is ${weakestSubject.subjectName}. CampusMate has identified ${risks.length} academic risk${
    risks.length === 1 ? "" : "s"
  } that you can address through your study plan.`;
}

function createEmptyAcademicHealth(): AcademicHealthData {
  const emptyMetric = createHealthMetric(
    0,
    "No data",
    "There is not enough academic data yet.",
  );

  return {
    overallScore: 0,

    overallLevel: "critical",

    attendance: emptyMetric,
    assignments: emptyMetric,
    syllabus: emptyMetric,
    studyConsistency: emptyMetric,
    examReadiness: emptyMetric,

    subjects: [],

    risks: [],

    recommendations: [],

    trend: [],

    summary:
      "Add subjects, attendance, assignments and study activity to generate your Academic Health report.",

    generatedAt:
      new Date().toISOString(),
  };
}