"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function getStudentId(
  userId: string,
): Promise<string> {
  const supabase =
    await createClient();

  const {
    data: student,
    error,
  } =
    await supabase
      .from("students")
      .select("id")
      .eq(
        "profile_id",
        userId,
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load student: ${error.message}`,
    );
  }

  if (!student) {
    throw new Error(
      "Student record not found.",
    );
  }

  return student.id;
}

async function requireStudent() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const studentId =
    await getStudentId(
      user.id,
    );

  return {
    user,
    studentId,
  };
}


/*
============================================================
1. UPDATE TOPIC PROGRESS
============================================================
*/

export async function updateExamTopicProgress(
  input: {
    examId: string;
    topicId: string;
    status:
      | "not_started"
      | "learning"
      | "revising"
      | "completed";
    coveragePercentage: number;
    confidenceLevel: number;
    estimatedMinutes: number;
    actualMinutes: number;
    notes?: string;
  },
) {
  const {
    studentId,
  } = await requireStudent();

  const supabase =
    await createClient();

  const coverage =
    Math.max(
      0,
      Math.min(
        100,
        input.coveragePercentage,
      ),
    );

  const confidence =
    Math.max(
      0,
      Math.min(
        100,
        input.confidenceLevel,
      ),
    );

  const {
    error,
  } =
    await supabase
      .from(
        "exam_topic_progress",
      )
      .upsert(
        {
          exam_id:
            input.examId,

          student_id:
            studentId,

          topic_id:
            input.topicId,

          status:
            input.status,

          coverage_percentage:
            coverage,

          confidence_level:
            confidence,

          estimated_minutes:
            Math.max(
              0,
              input.estimatedMinutes,
            ),

          actual_minutes:
            Math.max(
              0,
              input.actualMinutes,
            ),

          last_studied_at:
            input.actualMinutes > 0
              ? new Date().toISOString()
              : null,

          notes:
            input.notes ?? null,
        },
        {
          onConflict:
            "exam_id,student_id,topic_id",
        },
      );

  if (error) {
    throw new Error(
      `Unable to update topic progress: ${error.message}`,
    );
  }

  revalidatePath(
    "/exams",
  );

  revalidatePath(
    "/dashboard",
  );

  return {
    success: true,
  };
}


/*
============================================================
2. CREATE REVISION PLAN
============================================================
*/

export async function createExamRevisionPlan(
  input: {
    examId: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    availableMinutesPerDay: number;
    generatedBy?:
      | "manual"
      | "rule_engine"
      | "ai";
  },
) {
  const {
    studentId,
  } = await requireStudent();

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "exam_revision_plans",
      )
      .upsert(
        {
          exam_id:
            input.examId,

          student_id:
            studentId,

          title:
            input.title,

          description:
            input.description ??
            null,

          start_date:
            input.startDate ??
            null,

          end_date:
            input.endDate ??
            null,

          available_minutes_per_day:
            Math.max(
              0,
              input.availableMinutesPerDay,
            ),

          status:
            "active",

          generated_by:
            input.generatedBy ??
            "manual",
        },
        {
          onConflict:
            "exam_id,student_id",
        },
      )
      .select("id")
      .single();

  if (error) {
    throw new Error(
      `Unable to create revision plan: ${error.message}`,
    );
  }

  revalidatePath(
    "/exams",
  );

  return {
    success: true,
    planId: data.id,
  };
}


/*
============================================================
3. ADD REVISION ITEM
============================================================
*/

export async function addExamRevisionItem(
  input: {
    planId: string;
    topicId?: string;
    scheduledDate: string;
    title: string;
    description?: string;
    plannedMinutes: number;
    priority?:
      | "low"
      | "normal"
      | "high"
      | "critical";
  },
) {
  const {
    studentId,
  } = await requireStudent();

  const supabase =
    await createClient();

  /*
   * Verify the plan belongs to the
   * currently logged-in student.
   */

  const {
    data: plan,
    error: planError,
  } =
    await supabase
      .from(
        "exam_revision_plans",
      )
      .select(
        "id",
      )
      .eq(
        "id",
        input.planId,
      )
      .eq(
        "student_id",
        studentId,
      )
      .maybeSingle();

  if (planError) {
    throw new Error(
      `Unable to verify revision plan: ${planError.message}`,
    );
  }

  if (!plan) {
    throw new Error(
      "Revision plan not found.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "exam_revision_items",
      )
      .insert(
        {
          plan_id:
            input.planId,

          topic_id:
            input.topicId ??
            null,

          scheduled_date:
            input.scheduledDate,

          title:
            input.title,

          description:
            input.description ??
            null,

          planned_minutes:
            Math.max(
              0,
              input.plannedMinutes,
            ),

          priority:
            input.priority ??
            "normal",

          status:
            "pending",
        },
      )
      .select("id")
      .single();

  if (error) {
    throw new Error(
      `Unable to add revision item: ${error.message}`,
    );
  }

  revalidatePath(
    "/exams",
  );

  return {
    success: true,
    itemId: data.id,
  };
}


/*
============================================================
4. UPDATE REVISION ITEM STATUS
============================================================
*/

export async function updateExamRevisionItemStatus(
  input: {
    itemId: string;
    status:
      | "pending"
      | "in_progress"
      | "completed"
      | "skipped";
    actualMinutes?: number;
  },
) {
  const {
    studentId,
  } = await requireStudent();

  const supabase =
    await createClient();

  const {
    data: item,
    error: itemError,
  } =
    await supabase
      .from(
        "exam_revision_items",
      )
      .select(
        `
          id,
          plan_id
        `,
      )
      .eq(
        "id",
        input.itemId,
      )
      .maybeSingle();

  if (itemError) {
    throw new Error(
      `Unable to load revision item: ${itemError.message}`,
    );
  }

  if (!item) {
    throw new Error(
      "Revision item not found.",
    );
  }

  const {
    data: plan,
    error: planError,
  } =
    await supabase
      .from(
        "exam_revision_plans",
      )
      .select(
        "id",
      )
      .eq(
        "id",
        item.plan_id,
      )
      .eq(
        "student_id",
        studentId,
      )
      .maybeSingle();

  if (planError) {
    throw new Error(
      `Unable to verify revision plan: ${planError.message}`,
    );
  }

  if (!plan) {
    throw new Error(
      "You do not have access to this revision item.",
    );
  }

  const {
    error,
  } =
    await supabase
      .from(
        "exam_revision_items",
      )
      .update(
        {
          status:
            input.status,

          actual_minutes:
            Math.max(
              0,
              input.actualMinutes ??
                0,
            ),

          completed_at:
            input.status ===
            "completed"
              ? new Date().toISOString()
              : null,
        },
      )
      .eq(
        "id",
        input.itemId,
      );

  if (error) {
    throw new Error(
      `Unable to update revision item: ${error.message}`,
    );
  }

  revalidatePath(
    "/exams",
  );

  return {
    success: true,
  };
}