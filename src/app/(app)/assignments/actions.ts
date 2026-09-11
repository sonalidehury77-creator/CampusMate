"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const assignmentStatusSchema = z.object({
  assignmentId: z
    .string()
    .uuid(),

  status: z.enum([
    "pending",
    "in_progress",
    "completed",
  ]),

  notes: z
    .string()
    .max(2000)
    .optional(),
});

export type AssignmentActionResult = {
  success: boolean;
  message: string;
};

export async function updateAssignmentStatus(
  formData: FormData,
): Promise<AssignmentActionResult> {
  const rawData = {
    assignmentId:
      formData.get("assignmentId"),

    status:
      formData.get("status"),

    notes:
      formData.get("notes") ?? undefined,
  };

  const validation =
    assignmentStatusSchema.safeParse(
      rawData,
    );

  if (!validation.success) {
    return {
      success: false,
      message:
        "Invalid assignment update.",
    };
  }

  const {
    assignmentId,
    status,
    notes,
  } = validation.data;

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsError
    ? null
    : claimsData?.claims;

  const userId = claims?.sub;

  if (!userId) {
    return {
      success: false,
      message:
        "Your session has expired. Please log in again.",
    };
  }

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select("id")
      .eq("profile_id", userId)
      .single();

  if (studentError || !student) {
    return {
      success: false,
      message:
        "Student profile not found.",
    };
  }

  /*
   * Security check:
   * The assignment must belong to a subject
   * in which this student is enrolled.
   */
  const { data: assignment, error: assignmentError } =
    await supabase
      .from("assignments")
      .select("id, subject_id")
      .eq("id", assignmentId)
      .single();

  if (assignmentError || !assignment) {
    return {
      success: false,
      message:
        "Assignment not found.",
    };
  }

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("student_subjects")
    .select("id")
    .eq("student_id", student.id)
    .eq(
      "subject_id",
      assignment.subject_id,
    )
    .maybeSingle();

  if (enrollmentError || !enrollment) {
    return {
      success: false,
      message:
        "You are not enrolled in this assignment's subject.",
    };
  }

  const completedAt =
    status === "completed"
      ? new Date().toISOString()
      : null;

  const { error: upsertError } =
    await supabase
      .from("assignment_status")
      .upsert(
        {
          assignment_id:
            assignmentId,

          student_id:
            student.id,

          status,

          completed_at:
            completedAt,

          notes:
            notes?.trim() || null,
        },
        {
          onConflict:
            "assignment_id,student_id",
        },
      );

  if (upsertError) {
    console.error(
      "Assignment status update error:",
      upsertError,
    );

    return {
      success: false,
      message:
        "Unable to update assignment status.",
    };
  }

  revalidatePath("/assignments");
  revalidatePath("/dashboard");

  return {
    success: true,
    message:
      "Assignment updated successfully.",
  };
}