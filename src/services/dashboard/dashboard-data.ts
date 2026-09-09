import { createClient } from "@/lib/supabase/server";

export async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("id", userId)
    .single();

  if (profileError) {
    throw new Error("Unable to load your profile.");
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(
      "id, student_number, enrollment_year, current_semester, program_id, semester_id",
    )
    .eq("profile_id", userId)
    .single();

  if (studentError) {
    throw new Error("Unable to load your student information.");
  }

  const { data: program } = await supabase
    .from("programs")
    .select("id, name, code, department_id")
    .eq("id", student.program_id)
    .single();

  const { data: department } = program
    ? await supabase
        .from("departments")
        .select("id, name, code")
        .eq("id", program.department_id)
        .single()
    : { data: null };

  const { data: semester } = await supabase
    .from("semesters")
    .select("id, semester_number, academic_year")
    .eq("id", student.semester_id)
    .single();

  return {
    profile,
    student,
    program,
    department,
    semester,
  };
}