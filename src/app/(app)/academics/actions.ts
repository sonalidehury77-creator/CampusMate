"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const progressSchema = z.object({
  subjectId: z.string().uuid(),
  progress: z.coerce.number().min(0).max(100),
});

const unitProgressSchema = z.object({
  subjectId: z.string().uuid(),
  unitNumber: z.coerce.number().int().positive(),
  progress: z.coerce.number().min(0).max(100),
  completed: z.coerce.boolean(),
});

export async function updateSubjectProgress(
  formData: FormData,
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsError
    ? null
    : claimsData?.claims;

  if (!claims?.sub) {
    throw new Error("You must be logged in.");
  }

  const parsed = progressSchema.safeParse({
    subjectId: formData.get("subjectId"),
    progress: formData.get("progress"),
  });

  if (!parsed.success) {
    throw new Error("Invalid progress value.");
  }

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select("id, semester_id")
      .eq("profile_id", claims.sub)
      .single();

  if (studentError || !student) {
    throw new Error("Student record not found.");
  }

  const { data: subject, error: subjectError } =
    await supabase
      .from("subjects")
      .select("id")
      .eq("id", parsed.data.subjectId)
      .eq("semester_id", student.semester_id)
      .single();

  if (subjectError || !subject) {
    throw new Error("Invalid subject.");
  }

  const { error } = await supabase
    .from("student_subject_progress")
    .upsert(
      {
        student_id: student.id,
        subject_id: parsed.data.subjectId,
        progress_percentage: parsed.data.progress,
      },
      {
        onConflict: "student_id,subject_id",
      },
    );

  if (error) {
    throw new Error(
      "Unable to update subject progress.",
    );
  }

  revalidatePath("/academics");
  revalidatePath(
    `/academics/${parsed.data.subjectId}`,
  );
  revalidatePath("/dashboard");
}

export async function updateUnitProgress(
  formData: FormData,
) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsError
    ? null
    : claimsData?.claims;

  if (!claims?.sub) {
    throw new Error("You must be logged in.");
  }

  const parsed = unitProgressSchema.safeParse({
    subjectId: formData.get("subjectId"),
    unitNumber: formData.get("unitNumber"),
    progress: formData.get("progress"),
    completed:
      formData.get("completed") === "true",
  });

  if (!parsed.success) {
    throw new Error("Invalid unit progress.");
  }

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select("id, semester_id")
      .eq("profile_id", claims.sub)
      .single();

  if (studentError || !student) {
    throw new Error("Student record not found.");
  }

  const { data: subject, error: subjectError } =
    await supabase
      .from("subjects")
      .select("id")
      .eq("id", parsed.data.subjectId)
      .eq("semester_id", student.semester_id)
      .single();

  if (subjectError || !subject) {
    throw new Error("Invalid subject.");
  }

  const { data: unit, error: unitError } =
    await supabase
      .from("syllabus_units")
      .select("id")
      .eq("subject_id", parsed.data.subjectId)
      .eq(
        "unit_number",
        parsed.data.unitNumber,
      )
      .single();

  if (unitError || !unit) {
    throw new Error("Invalid syllabus unit.");
  }

  const { error } = await supabase
    .from("unit_progress")
    .upsert(
      {
        student_id: student.id,
        subject_id: parsed.data.subjectId,
        unit_number: parsed.data.unitNumber,
        progress_percentage:
          parsed.data.progress,
        completed: parsed.data.completed,
      },
      {
        onConflict:
          "student_id,subject_id,unit_number",
      },
    );

  if (error) {
    throw new Error(
      "Unable to update unit progress.",
    );
  }

  revalidatePath(
    `/academics/${parsed.data.subjectId}`,
  );

  revalidatePath("/academics");

  revalidatePath("/dashboard");
}