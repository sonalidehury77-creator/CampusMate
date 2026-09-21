"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function getCurrentStudentId() {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    throw new Error(
      "You must be signed in.",
    );
  }

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id")
    .eq(
      "profile_id",
      user.id,
    )
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

  return {
    supabase,
    studentId:
      student.id,
  };
}

export async function saveOpportunity(
  formData: FormData,
): Promise<void> {
  const {
    supabase,
    studentId,
  } =
    await getCurrentStudentId();

  const opportunityId =
    String(
      formData.get(
        "opportunity_id",
      ) ?? "",
    ).trim();

  if (!opportunityId) {
    throw new Error(
      "Opportunity ID is missing.",
    );
  }

  const { error } =
    await supabase
      .from(
        "opportunity_applications",
      )
      .upsert(
        {
          opportunity_id:
            opportunityId,
          student_id:
            studentId,
          status: "saved",
        },
        {
          onConflict:
            "opportunity_id,student_id",
        },
      );

  if (error) {
    throw new Error(
      `Unable to save opportunity: ${error.message}`,
    );
  }

  revalidatePath(
    "/opportunities",
  );

  revalidatePath(
    `/opportunities/${opportunityId}`,
  );
}

export async function markOpportunityApplied(
  formData: FormData,
): Promise<void> {
  const {
    supabase,
    studentId,
  } =
    await getCurrentStudentId();

  const opportunityId =
    String(
      formData.get(
        "opportunity_id",
      ) ?? "",
    ).trim();

  if (!opportunityId) {
    throw new Error(
      "Opportunity ID is missing.",
    );
  }

  const { error } =
    await supabase
      .from(
        "opportunity_applications",
      )
      .upsert(
        {
          opportunity_id:
            opportunityId,
          student_id:
            studentId,
          status: "applied",
          applied_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "opportunity_id,student_id",
        },
      );

  if (error) {
    throw new Error(
      `Unable to track application: ${error.message}`,
    );
  }

  revalidatePath(
    "/opportunities",
  );

  revalidatePath(
    `/opportunities/${opportunityId}`,
  );

  revalidatePath(
    "/opportunities/track",
  );
}

export async function updateOpportunityApplication(
  formData: FormData,
): Promise<void> {
  const {
    supabase,
    studentId,
  } =
    await getCurrentStudentId();

  const id =
    String(
      formData.get("id") ?? "",
    ).trim();

  const status =
    String(
      formData.get(
        "status",
      ) ?? "",
    ).trim();

  const notes =
    String(
      formData.get(
        "notes",
      ) ?? "",
    ).trim();

  if (!id) {
    throw new Error(
      "Application ID is missing.",
    );
  }

  const allowedStatuses = [
    "saved",
    "applied",
    "shortlisted",
    "selected",
    "rejected",
    "withdrawn",
  ];

  if (
    !allowedStatuses.includes(
      status,
    )
  ) {
    throw new Error(
      "Invalid application status.",
    );
  }

  const { error } =
    await supabase
      .from(
        "opportunity_applications",
      )
      .update({
        status,
        notes:
          notes || null,
      })
      .eq(
        "id",
        id,
      )
      .eq(
        "student_id",
        studentId,
      );

  if (error) {
    throw new Error(
      `Unable to update application: ${error.message}`,
    );
  }

  revalidatePath(
    "/opportunities",
  );

  revalidatePath(
    "/opportunities/track",
  );
}

export async function removeOpportunityApplication(
  formData: FormData,
): Promise<void> {
  const {
    supabase,
    studentId,
  } =
    await getCurrentStudentId();

  const id =
    String(
      formData.get("id") ?? "",
    ).trim();

  if (!id) {
    throw new Error(
      "Application ID is missing.",
    );
  }

  const { error } =
    await supabase
      .from(
        "opportunity_applications",
      )
      .delete()
      .eq(
        "id",
        id,
      )
      .eq(
        "student_id",
        studentId,
      );

  if (error) {
    throw new Error(
      `Unable to remove opportunity: ${error.message}`,
    );
  }

  revalidatePath(
    "/opportunities",
  );

  revalidatePath(
    "/opportunities/track",
  );
}