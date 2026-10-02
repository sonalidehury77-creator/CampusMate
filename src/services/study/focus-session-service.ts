import {
  createClient,
} from "@/lib/supabase/server";

export async function startFocusSession(
  studyItemId: string,
) {
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
      "Authentication required.",
    );
  }

  const {
    data: student,
    error: studentError,
  } =
    await supabase
      .from("students")
      .select("id")
      .eq(
        "profile_id",
        user.id,
      )
      .maybeSingle();

  if (studentError) {
    throw studentError;
  }

  if (!student) {
    throw new Error(
      "Student not found.",
    );
  }

  const {
    data: item,
    error: itemError,
  } =
    await supabase
      .from(
        "smart_study_items",
      )
      .select("*")
      .eq(
        "id",
        studyItemId,
      )
      .eq(
        "student_id",
        student.id,
      )
      .maybeSingle();

  if (itemError) {
    throw itemError;
  }

  if (!item) {
    throw new Error(
      "Study item not found.",
    );
  }

  const {
    data: existing,
    error: existingError,
  } =
    await supabase
      .from(
        "smart_focus_sessions",
      )
      .select("id")
      .eq(
        "student_id",
        student.id,
      )
      .eq(
        "status",
        "active",
      )
      .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    throw new Error(
      "You already have an active focus session.",
    );
  }

  const {
    data: session,
    error,
  } =
    await supabase
      .from(
        "smart_focus_sessions",
      )
      .insert({
        student_id:
          student.id,

        study_item_id:
          item.id,

        subject_id:
          item.subject_id,

        topic_id:
          item.topic_id,

        started_at:
          new Date().toISOString(),

        planned_minutes:
          item.planned_minutes,

        status:
          "active",
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  await supabase
    .from(
      "smart_study_items",
    )
    .update({
      status:
        "in_progress",
    })
    .eq(
      "id",
      studyItemId,
    )
    .eq(
      "student_id",
      student.id,
    );

  return session;
}

export async function completeFocusSession(
  sessionId: string,
  input: {
    actualMinutes: number;
    completionPercentage: number;
    selfRating?: number;
    difficultyRating?: number;
    confidenceBefore?: number;
    confidenceAfter?: number;
    notes?: string;
  },
) {
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
      "Authentication required.",
    );
  }

  const {
    data: student,
  } =
    await supabase
      .from("students")
      .select("id")
      .eq(
        "profile_id",
        user.id,
      )
      .maybeSingle();

  if (!student) {
    throw new Error(
      "Student not found.",
    );
  }

  const {
    data: session,
    error: sessionError,
  } =
    await supabase
      .from(
        "smart_focus_sessions",
      )
      .select("*")
      .eq(
        "id",
        sessionId,
      )
      .eq(
        "student_id",
        student.id,
      )
      .maybeSingle();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    throw new Error(
      "Focus session not found.",
    );
  }

  const endedAt =
    new Date();

  const {
    data: updated,
    error,
  } =
    await supabase
      .from(
        "smart_focus_sessions",
      )
      .update({
        ended_at:
          endedAt.toISOString(),

        actual_minutes:
          Math.max(
            0,
            input.actualMinutes,
          ),

        status:
          "completed",

        completion_percentage:
          Math.max(
            0,
            Math.min(
              100,
              input.completionPercentage,
            ),
          ),

        self_rating:
          input.selfRating ??
          null,

        difficulty_rating:
          input.difficultyRating ??
          null,

        confidence_before:
          input.confidenceBefore ??
          null,

        confidence_after:
          input.confidenceAfter ??
          null,

        notes:
          input.notes ??
          null,
      })
      .eq(
        "id",
        sessionId,
      )
      .eq(
        "student_id",
        student.id,
      )
      .select()
      .single();

  if (error) {
    throw error;
  }

  if (session.study_item_id) {
    const completed =
      input.completionPercentage >= 100;

    await supabase
      .from(
        "smart_study_items",
      )
      .update({
        status:
          completed
            ? "completed"
            : "partially_completed",

        actual_minutes:
          Math.max(
            0,
            input.actualMinutes,
          ),

        completion_percentage:
          Math.max(
            0,
            Math.min(
              100,
              input.completionPercentage,
            ),
          ),

        confidence_before:
          input.confidenceBefore ??
          null,

        confidence_after:
          input.confidenceAfter ??
          null,

        completed_at:
          completed
            ? endedAt.toISOString()
            : null,
      })
      .eq(
        "id",
        session.study_item_id,
      )
      .eq(
        "student_id",
        student.id,
      );
  }

  return updated;
}