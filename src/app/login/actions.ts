"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  const redirectTo =
    formData.get("redirect")?.toString() || "/dashboard";

  if (!email || !password) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Please enter your email and password.",
      )}`,
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(redirectTo);
}