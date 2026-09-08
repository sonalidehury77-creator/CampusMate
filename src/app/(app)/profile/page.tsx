import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";

import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * --------------------------------------------------
   * PROFILE
   * --------------------------------------------------
   */

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select(
        "id, email, full_name, phone, role, avatar_url",
      )
      .eq("id", user.id)
      .single();

  if (profileError) {
    console.error(
      "Profile loading error:",
      profileError,
    );

    throw new Error(
      "Could not load your profile.",
    );
  }

  /*
   * --------------------------------------------------
   * STUDENT
   * --------------------------------------------------
   */

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select(
        "id, student_number, program_id, semester_id, enrollment_year, current_semester",
      )
      .eq("profile_id", user.id)
      .maybeSingle();

  if (studentError) {
    console.error(
      "Student loading error:",
      studentError,
    );

    throw new Error(
      "Could not load your student information.",
    );
  }

  if (!student) {
    redirect("/onboarding");
  }

  /*
   * --------------------------------------------------
   * PROGRAM
   * --------------------------------------------------
   */

  const { data: program } =
    await supabase
      .from("programs")
      .select(
        "id, name, code, department_id",
      )
      .eq("id", student.program_id)
      .single();

  /*
   * --------------------------------------------------
   * DEPARTMENT
   * --------------------------------------------------
   */

  const { data: department } =
    await supabase
      .from("departments")
      .select("id, name, code")
      .eq(
        "id",
        program?.department_id ?? "",
      )
      .single();

  /*
   * --------------------------------------------------
   * SEMESTER
   * --------------------------------------------------
   */

  const { data: semester } =
    await supabase
      .from("semesters")
      .select(
        "id, semester_number, academic_year",
      )
      .eq("id", student.semester_id)
      .single();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="My Profile"
        description="Manage your personal information and view your academic details."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}

        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-24 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
              {(profile.full_name?.trim()?.[0] ??
                "S"
              ).toUpperCase()}
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              {profile.full_name ||
                "Student"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {profile.email}
            </p>

            <span className="mt-3 rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
              {profile.role}
            </span>
          </div>
        </Card>

        {/* Personal information */}

        <Card className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Update the information that can be changed from your profile.
            </p>
          </div>

          <ProfileForm
            fullName={
              profile.full_name ?? ""
            }
            phone={profile.phone ?? ""}
          />
        </Card>
      </div>

      {/* Academic information */}

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Academic Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your academic information is linked to your student record.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AcademicItem
            label="Student Number"
            value={
              student.student_number
            }
          />

          <AcademicItem
            label="Department"
            value={
              department
                ? `${department.name} (${department.code})`
                : "Not available"
            }
          />

          <AcademicItem
            label="Program"
            value={
              program
                ? `${program.name} (${program.code})`
                : "Not available"
            }
          />

          <AcademicItem
            label="Current Semester"
            value={
              semester
                ? `Semester ${semester.semester_number}`
                : `Semester ${student.current_semester}`
            }
          />

          <AcademicItem
            label="Academic Year"
            value={
              semester?.academic_year ??
              "Not available"
            }
          />

          <AcademicItem
            label="Enrollment Year"
            value={String(
              student.enrollment_year,
            )}
          />
        </div>
      </Card>
    </div>
  );
}

function AcademicItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}