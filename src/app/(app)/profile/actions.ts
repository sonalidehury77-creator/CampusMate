"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ProfileState = {
  message: string | null;
  success: boolean;
};

export const initialProfileState: ProfileState = {
  message: null,
  success: false,
};

const ProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(150, "Full name is too long."),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .transform((value) => value || null),
});

export async function updateProfile(
  _previousState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsError ? null : claimsData?.claims;

  if (!claims?.sub) {
    return {
      message: "Your session has expired.",
      success: false,
    };
  }

  const validation = ProfileSchema.safeParse({
    fullName: formData.get("full_name"),
    phone: formData.get("phone"),
  });

  if (!validation.success) {
    return {
      message:
        validation.error.issues[0]?.message ??
        "Please check your information.",
      success: false,
    };
  }

  const { fullName, phone } = validation.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
    })
    .eq("id", claims.sub);

  if (error) {
    console.error("Profile update error:", error);

    return {
      message: "Your profile could not be updated.",
      success: false,
    };
  }

  return {
    message: "Profile updated successfully.",
    success: true,
  };
}