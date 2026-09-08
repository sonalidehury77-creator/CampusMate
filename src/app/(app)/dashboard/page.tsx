import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsError
    ? null
    : claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  const userId = claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", userId)
    .single();

  const { data: student } = await supabase
    .from("students")
    .select(
      `
        student_number,
        current_semester,
        program:programs (
          name,
          code
        ),
        semester:semesters (
          semester_number,
          academic_year
        )
      `,
    )
    .eq("profile_id", userId)
    .single();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome${
          profile?.full_name
            ? `, ${profile.full_name}`
            : ""
        }!`}
        description="Your CampusMate student workspace."
        actions={
          <Badge variant="success">
            {profile?.role ?? "student"}
          </Badge>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-muted-foreground">
            Student number
          </p>

          <p className="mt-2 text-lg font-semibold">
            {student?.student_number ??
              "Not available"}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">
            Program
          </p>

          <p className="mt-2 text-lg font-semibold">
            {student?.program?.name ??
              "Not available"}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">
            Semester
          </p>

          <p className="mt-2 text-lg font-semibold">
            {student?.semester
              ? `Semester ${student.semester.semester_number}`
              : "Not available"}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">
            Academic year
          </p>

          <p className="mt-2 text-lg font-semibold">
            {student?.semester?.academic_year ??
              "Not available"}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">
          CampusMate is ready
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your student identity is now connected to
          CampusMate. Future modules such as subjects,
          timetable, assignments, attendance, resources
          and academic analytics will use this academic
          profile.
        </p>
      </Card>
    </div>
  );
}