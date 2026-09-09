"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const updateUnitProgressSchema = z.object({
  subjectId: z.string().uuid(),
  unitNumber: z.coerce
    .number()
    .int()
    .positive(),
  progressPercentage: z.coerce
    .number()
    .min(0)
    .max(100),
  completed: z.boolean(),
});

export async function updateUnitProgress(
  input: unknown,
) {
  const parsed =
    updateUnitProgressSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid progress information.",
    };
  }

  const {
    subjectId,
    unitNumber,
    progressPercentage,
    completed,
  } = parsed.data;

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsError
    ? null
    : claimsData?.claims;

  if (!claims?.sub) {
    return {
      success: false,
      message: "You must be logged in.",
    };
  }

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select("id")
      .eq("profile_id", claims.sub)
      .single();

  if (studentError || !student) {
    return {
      success: false,
      message: "Student profile not found.",
    };
  }

  /*
   * Make sure the requested unit actually belongs
   * to the requested subject.
   */
  const { data: unit, error: unitError } =
    await supabase
      .from("syllabus_units")
      .select("id")
      .eq("subject_id", subjectId)
      .eq("unit_number", unitNumber)
      .single();

  if (unitError || !unit) {
    return {
      success: false,
      message: "Syllabus unit not found.",
    };
  }

  const finalProgress = completed
    ? 100
    : progressPercentage;

  const { error: upsertError } = await supabase
    .from("unit_progress")
    .upsert(
      {
        student_id: student.id,
        subject_id: subjectId,
        unit_number: unitNumber,
        progress_percentage: finalProgress,
        completed:
          completed || finalProgress === 100,
      },
      {
        onConflict:
          "student_id,subject_id,unit_number",
      },
    );

  if (upsertError) {
    console.error(
      "Unit progress update error:",
      upsertError,
    );

    return {
      success: false,
      message: "Unable to save unit progress.",
    };
  }

  /*
   * Recalculate subject progress from all units.
   */
  const { data: unitProgressRows } =
    await supabase
      .from("unit_progress")
      .select(
        "progress_percentage",
      )
      .eq("student_id", student.id)
      .eq("subject_id", subjectId);

  const averageProgress =
    unitProgressRows &&
    unitProgressRows.length > 0
      ? Math.round(
          unitProgressRows.reduce(
            (sum, row) =>
              sum +
              Number(
                row.progress_percentage,
              ),
            0,
          ) / unitProgressRows.length,
        )
      : 0;

  const { error: subjectProgressError } =
    await supabase
      .from("student_subject_progress")
      .upsert(
        {
          student_id: student.id,
          subject_id: subjectId,
          progress_percentage:
            averageProgress,
        },
        {
          onConflict:
            "student_id,subject_id",
        },
      );

  if (subjectProgressError) {
    console.error(
      "Subject progress update error:",
      subjectProgressError,
    );

    return {
      success: false,
      message:
        "Unit saved, but subject progress could not be updated.",
    };
  }

  revalidatePath("/academics");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Progress updated.",
  };
}