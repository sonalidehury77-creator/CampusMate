import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";

import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsError ? null : claimsData?.claims;

  if (!claims?.sub) {
    return null;
  }

  const userId = claims.sub;

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select(
        "full_name, email, phone, avatar_url, role",
      )
      .eq("id", userId)
      .single();

  if (profileError || !profile) {
    throw new Error(
      `Could not load your profile: ${
        profileError?.message ?? "Profile not found."
      }`,
    );
  }

  /*
   * Load only columns that definitely exist
   * in the 901 students table.
   */
  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select(
        "student_number, program_id, semester_id, enrollment_year, current_semester",
      )
      .eq("profile_id", userId)
      .maybeSingle();

  if (studentError) {
    throw new Error(
      `Could not load your student information: ${studentError.message}`,
    );
  }

  if (!student) {
    throw new Error(
      "No student record was found. Please complete onboarding first.",
    );
  }

  const { data: program, error: programError } =
    await supabase
      .from("programs")
      .select(
        "id, name, code, department_id",
      )
      .eq("id", student.program_id)
      .single();

  if (programError || !program) {
    throw new Error(
      `Could not load your program: ${
        programError?.message ?? "Program not found."
      }`,
    );
  }

  const { data: department, error: departmentError } =
    await supabase
      .from("departments")
      .select("id, name, code")
      .eq("id", program.department_id)
      .single();

  if (departmentError || !department) {
    throw new Error(
      `Could not load your department: ${
        departmentError?.message ?? "Department not found."
      }`,
    );
  }

  const { data: semester, error: semesterError } =
    await supabase
      .from("semesters")
      .select(
        "id, semester_number, academic_year",
      )
      .eq("id", student.semester_id)
      .single();

  if (semesterError || !semester) {
    throw new Error(
      `Could not load your semester: ${
        semesterError?.message ?? "Semester not found."
      }`,
    );
  }

  const initials = getInitials(
    profile.full_name ?? "CampusMate Student",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and view your academic identity."
      />

      <Card className="overflow-hidden p-0">
        <div className="bg-linear-to-r from-brand-600 to-brand-700 px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold ring-4 ring-white/20">
              {initials}
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {profile.full_name ||
                  "CampusMate Student"}
              </h2>

              <p className="mt-1 text-sm text-white/80">
                {profile.email}
              </p>

              <div className="mt-3">
                <Badge variant="success">
                  {profile.role ?? "student"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold">
              Personal information
            </h3>

            <div className="mt-5">
              <ProfileForm
                fullName={profile.full_name ?? ""}
                phone={profile.phone ?? ""}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              Academic information
            </h3>

            <div className="mt-5 space-y-4">
              <InfoRow
                label="Student number"
                value={student.student_number}
              />

              <InfoRow
                label="Department"
                value={department.name}
              />

              <InfoRow
                label="Program"
                value={program.name}
              />

              <InfoRow
                label="Program code"
                value={program.code}
              />

              <InfoRow
                label="Current semester"
                value={`Semester ${semester.semester_number}`}
              />

              <InfoRow
                label="Academic year"
                value={semester.academic_year}
              />

              <InfoRow
                label="Enrollment year"
                value={
                  student.enrollment_year?.toString() ??
                  "Not available"
                }
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "CM";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}