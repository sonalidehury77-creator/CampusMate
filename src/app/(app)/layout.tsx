import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsError ? null : claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", claims.sub)
    .maybeSingle();

  if (studentError) {
    console.error("Student profile lookup error:", studentError);

    throw new Error(
      `Could not verify your student profile: ${studentError.message}`,
    );
  }

  if (!student) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}