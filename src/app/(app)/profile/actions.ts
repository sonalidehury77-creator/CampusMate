"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(
      2,
      "Full name must contain at least 2 characters.",
    )
    .max(
      100,
      "Full name is too long.",
    ),

  phone: z
    .string()
    .trim()
    .max(
      20,
      "Phone number is too long.",
    )
    .optional()
    .or(z.literal("")),
});

export type ProfileState = {
  message: string | null;
  errors: Record<
    string,
    string[] | undefined
  >;
};

export async function updateProfile(
  previousState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message:
        "You must be logged in to update your profile.",
      errors: {},
    };
  }

  const rawData = {
    fullName: String(
      formData.get("full_name") ?? "",
    ),

    phone: String(
      formData.get("phone") ?? "",
    ),
  };

  const validation =
    profileSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      message:
        "Please correct the highlighted fields.",
      errors:
        validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      phone: data.phone || null,
    })
    .eq("id", user.id);

  if (error) {
    console.error(
      "Profile update error:",
      error,
    );

    return {
      message:
        "Could not update your profile.",
      errors: {},
    };
  }

  return {
    message:
      "Your profile has been updated successfully.",
    errors: {},
  };
}