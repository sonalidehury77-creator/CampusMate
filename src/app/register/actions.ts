"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function register(formData: FormData) {
  const fullName = formData.get("full_name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!fullName || !email || !password) {
    redirect("/register?error=Please%20fill%20in%20all%20fields");
  }

  if (password.length < 6) {
    redirect(
      "/register?error=Password%20must%20be%20at%20least%206%20characters",
    );
  }

  const supabase = await createClient();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    redirect(
      `/register?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    `/register?success=${encodeURIComponent(
      "Registration successful. Please check your email to confirm your account.",
    )}`,
  );
}