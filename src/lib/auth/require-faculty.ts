import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireFaculty() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load faculty profile: ${error.message}`,
    );
  }

  if (!profile) {
    redirect("/onboarding");
  }

  if (profile.role !== "faculty") {
    redirect("/dashboard");
  }

  return {
    user,
    profile,
  };
}