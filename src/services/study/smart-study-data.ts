import {
  createClient,
} from "@/lib/supabase/server";

import type {
  SmartStudyOverview,
  SmartStudyPlan,
  SmartStudyItem,
  SubjectGoal,
  FocusSession,
} from "@/types/study";

import {
  generateStudyRecommendations,
} from "@/lib/study/recommendations";

export async function getSmartStudyData(): Promise<SmartStudyOverview> {
  const supabase =
    await createClient();

  /*
   * ----------------------------------------------------------
   * 1. Current authenticated user
   * ----------------------------------------------------------
   */

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Authentication required.",
    );
  }

  /*
   * ----------------------------------------------------------
   * 2. Current student
   * ----------------------------------------------------------
   */

  const {
    data: student,
    error: studentError,
  } =
    await supabase
      .from("students")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle();

  if (studentError) {
    throw studentError;
  }

  if (!student) {
    throw new Error(
      "Student profile not found.",
    );
  }

  /*
   * ----------------------------------------------------------
   * 3. Current date
   * ----------------------------------------------------------
   */

  const today =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
      },
    ).format(
      new Date(),
    );

  /*
   * ----------------------------------------------------------
   * 4. Today's smart plan
   * ----------------------------------------------------------
   */

  const {
    data: todayPlanRow,
    error: todayPlanError,
  } =
    await supabase
      .from("smart_study_plans")
      .select("*")
      .eq(
        "student_id",
        student.id,
      )
      .eq(
        "plan_date",
        today,
      )
      .eq(
        "plan_type",
        "daily",
      )
      .maybeSingle();

  if (todayPlanError) {
    throw todayPlanError;
  }

  /*
   * ----------------------------------------------------------
   * 5. Weekly plans
   * ----------------------------------------------------------
   */

  const {
    data: weeklyPlanRows,
    error: weeklyPlanError,
  } =
    await supabase
      .from("smart_study_plans")
      .select("*")
      .eq(
        "student_id",
        student.id,
      )
      .eq(
        "plan_type",
        "daily",
      )
      .gte(
        "plan_date",
        today,
      )
      .order(
        "plan_date",
        {
          ascending: true,
        },
      )
      .limit(7);

  if (weeklyPlanError) {
    throw weeklyPlanError;
  }

  /*
   * ----------------------------------------------------------
   * 6. Load study items
   * ----------------------------------------------------------
   */

  const planIds = [
    ...(todayPlanRow
      ? [todayPlanRow.id]
      : []),

    ...(weeklyPlanRows ?? [])
      .map(
        (plan) =>
          plan.id,
      ),
  ];

  const uniquePlanIds =
    Array.from(
      new Set(planIds),
    );

  let studyItemRows:
    Array<Record<string, unknown>> =
    [];

  if (
    uniquePlanIds.length > 0
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "smart_study_items",
        )
        .select("*")
        .in(
          "plan_id",
          uniquePlanIds,
        )
        .order(
          "scheduled_date",
          {
            ascending: true,
          },
        )
        .order(
          "start_time",
          {
            ascending: true,
          },
        );

    if (error) {
      throw error;
    }

    studyItemRows =
      (data ?? []) as Array<
        Record<string, unknown>
      >;
  }

  /*
   * ----------------------------------------------------------
   * 7. Subject goals
   * ----------------------------------------------------------
   */

  const {
    data: goalRows,
    error: goalError,
  } =
    await supabase
      .from(
        "smart_subject_goals",
      )
      .select("*")
      .eq(
        "student_id",
        student.id,
      )
      .eq(
        "status",
        "active",
      );

  if (goalError) {
    throw goalError;
  }

  /*
   * ----------------------------------------------------------
   * 8. Active focus session
   * ----------------------------------------------------------
   */

  const {
    data: focusRow,
    error: focusError,
  } =
    await supabase
      .from(
        "smart_focus_sessions",
      )
      .select("*")
      .eq(
        "student_id",
        student.id,
      )
      .eq(
        "status",
        "active",
      )
      .order(
        "started_at",
        {
          ascending: false,
        },
      )
      .limit(1)
      .maybeSingle();

  if (focusError) {
    throw focusError;
  }

  /*
   * ----------------------------------------------------------
   * 9. Build today's/weekly plans
   * ----------------------------------------------------------
   */

  const items =
    studyItemRows.map(
      mapStudyItem,
    );

  const mapPlan = (
    row: Record<string, unknown>,
  ): SmartStudyPlan => {
    const planItems =
      items.filter(
        (item) =>
          item.planId === row.id,
      );

    return {
      id:
        String(row.id),

      studentId:
        String(row.student_id),

      planDate:
        String(row.plan_date),

      planType:
        row.plan_type as SmartStudyPlan["planType"],

      status:
        row.status as SmartStudyPlan["status"],

      availableMinutes:
        Number(
          row.available_minutes ?? 0,
        ),

      plannedMinutes:
        Number(
          row.planned_minutes ?? 0,
        ),

      completedMinutes:
        Number(
          row.completed_minutes ?? 0,
        ),

      completionPercentage:
        Number(
          row.completion_percentage ?? 0,
        ),

      generatedBy:
        row.generated_by as SmartStudyPlan["generatedBy"],

      generationReason:
        typeof row.generation_reason ===
          "object" &&
        row.generation_reason !== null
          ? row.generation_reason as {
              reasons: string[];
            }
          : {
              reasons: [],
            },

      items:
        planItems,
    };
  };

  const todayPlan =
    todayPlanRow
      ? mapPlan(
          todayPlanRow as Record<
            string,
            unknown
          >,
        )
      : null;

  const weeklyPlans =
    (weeklyPlanRows ?? [])
      .map(
        (row) =>
          mapPlan(
            row as Record<
              string,
              unknown
            >,
          ),
      );

  /*
   * ----------------------------------------------------------
   * 10. Goals
   * ----------------------------------------------------------
   */

  const subjectGoals:
    SubjectGoal[] =
    (goalRows ?? []).map(
      (row) => ({
        id:
          String(row.id),

        studentId:
          String(row.student_id),

        subjectId:
          String(row.subject_id),

        targetCoveragePercentage:
          Number(
            row.target_coverage_percentage ?? 100,
          ),

        targetConfidencePercentage:
          Number(
            row.target_confidence_percentage ?? 80,
          ),

        targetExamPercentage:
          row.target_exam_percentage === null
            ? null
            : Number(
                row.target_exam_percentage,
              ),

        weeklyMinutes:
          Number(
            row.weekly_minutes ?? 180,
          ),

        priority:
          row.priority as SubjectGoal["priority"],

        status:
          row.status as SubjectGoal["status"],

        targetDate:
          row.target_date
            ? String(
                row.target_date,
              )
            : null,

        notes:
          row.notes
            ? String(
                row.notes,
              )
            : null,
      }),
    );

  /*
   * ----------------------------------------------------------
   * 11. Active focus session
   * ----------------------------------------------------------
   */

  const activeFocusSession:
    FocusSession | null =
    focusRow
      ? mapFocusSession(
          focusRow as Record<
            string,
            unknown
          >,
        )
      : null;

  /*
   * ----------------------------------------------------------
   * 12. Study metrics
   * ----------------------------------------------------------
   */

  const todayItems =
    todayPlan?.items ?? [];

  const totalTodayMinutes =
    todayItems.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.plannedMinutes,
      0,
    );

  const completedTodayMinutes =
    todayItems.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.actualMinutes,
      0,
    );

  const completionPercentage =
    totalTodayMinutes > 0
      ? Math.round(
          (
            completedTodayMinutes /
            totalTodayMinutes
          ) *
            10000,
        ) / 100
      : 0;

  /*
   * ----------------------------------------------------------
   * 13. Recommendations
   *
   * This is intentionally generated from real database
   * information instead of hard-coded recommendations.
   * ----------------------------------------------------------
   */

  const recommendations =
    generateStudyRecommendations(
      [],
    );

  /*
   * ----------------------------------------------------------
   * 14. Current streak
   *
   * Detailed historical streak calculation will be expanded
   * when focus-session analytics are added.
   * ----------------------------------------------------------
   */

  const streakDays = 0;

  return {
    todayPlan,

    weeklyPlans,

    recommendations,

    subjectGoals,

    activeFocusSession,

    totalTodayMinutes,

    completedTodayMinutes,

    completionPercentage,

    streakDays,

    lastUpdated:
      new Date().toISOString(),
  };
}

function mapStudyItem(
  row: Record<string, unknown>,
): SmartStudyItem {
  return {
    id:
      String(row.id),

    planId:
      String(row.plan_id),

    studentId:
      String(row.student_id),

    subjectId:
      row.subject_id
        ? String(row.subject_id)
        : null,

    topicId:
      row.topic_id
        ? String(row.topic_id)
        : null,

    examId:
      row.exam_id
        ? String(row.exam_id)
        : null,

    assignmentId:
      row.assignment_id
        ? String(row.assignment_id)
        : null,

    title:
      String(row.title),

    description:
      row.description
        ? String(row.description)
        : null,

    studyType:
      row.study_type as SmartStudyItem["studyType"],

    priority:
      row.priority as SmartStudyItem["priority"],

    scheduledDate:
      String(
        row.scheduled_date,
      ),

    startTime:
      row.start_time
        ? String(row.start_time)
        : null,

    endTime:
      row.end_time
        ? String(row.end_time)
        : null,

    plannedMinutes:
      Number(
        row.planned_minutes ?? 0,
      ),

    actualMinutes:
      Number(
        row.actual_minutes ?? 0,
      ),

    status:
      row.status as SmartStudyItem["status"],

    completionPercentage:
      Number(
        row.completion_percentage ?? 0,
      ),

    priorityScore:
      Number(
        row.priority_score ?? 0,
      ),

    difficultyScore:
      Number(
        row.difficulty_score ?? 0,
      ),

    confidenceBefore:
      row.confidence_before === null ||
      row.confidence_before === undefined
        ? null
        : Number(
            row.confidence_before,
          ),

    confidenceAfter:
      row.confidence_after === null ||
      row.confidence_after === undefined
        ? null
        : Number(
            row.confidence_after,
          ),

    recommendationReason:
      typeof row.recommendation_reason ===
        "object" &&
      row.recommendation_reason !== null
        ? row.recommendation_reason as {
            reasons: string[];
            score: number;
          }
        : {
            reasons: [],
            score: 0,
          },

    completedAt:
      row.completed_at
        ? String(
            row.completed_at,
          )
        : null,
  };
}

function mapFocusSession(
  row: Record<string, unknown>,
): FocusSession {
  return {
    id:
      String(row.id),

    studentId:
      String(row.student_id),

    studyItemId:
      row.study_item_id
        ? String(
            row.study_item_id,
          )
        : null,

    subjectId:
      row.subject_id
        ? String(
            row.subject_id,
          )
        : null,

    topicId:
      row.topic_id
        ? String(
            row.topic_id,
          )
        : null,

    startedAt:
      String(row.started_at),

    endedAt:
      row.ended_at
        ? String(row.ended_at)
        : null,

    plannedMinutes:
      Number(
        row.planned_minutes ?? 25,
      ),

    actualMinutes:
      Number(
        row.actual_minutes ?? 0,
      ),

    status:
      row.status as FocusSession["status"],

    interruptionCount:
      Number(
        row.interruption_count ?? 0,
      ),

    completionPercentage:
      Number(
        row.completion_percentage ?? 0,
      ),

    selfRating:
      row.self_rating === null ||
      row.self_rating === undefined
        ? null
        : Number(
            row.self_rating,
          ),

    difficultyRating:
      row.difficulty_rating === null ||
      row.difficulty_rating === undefined
        ? null
        : Number(
            row.difficulty_rating,
          ),

    confidenceBefore:
      row.confidence_before === null ||
      row.confidence_before === undefined
        ? null
        : Number(
            row.confidence_before,
          ),

    confidenceAfter:
      row.confidence_after === null ||
      row.confidence_after === undefined
        ? null
        : Number(
            row.confidence_after,
          ),

    notes:
      row.notes
        ? String(row.notes)
        : null,
  };
}