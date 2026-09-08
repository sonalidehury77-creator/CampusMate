"use server";

import { redirect } from "next/navigation";
import * as z from "zod";

import { createClient } from "@/lib/supabase/server";

export type OnboardingState = {
  message: string | null;
  errors: Record<string, string[] | undefined>;
};

const onboardingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters."),

  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  studentNumber: z
    .string()
    .trim()
    .min(1, "Student number is required."),

  departmentId: z
    .string()
    .uuid("Please select a valid department."),

  programId: z
    .string()
    .uuid("Please select a valid program."),

  semesterId: z
    .string()
    .uuid("Please select a valid semester."),

  enrollmentYear: z.coerce
    .number()
    .int()
    .min(
      2000,
      "Please enter a valid enrollment year.",
    )
    .max(
      2100,
      "Please enter a valid enrollment year.",
    ),
});

export async function completeOnboarding(
  prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();

  /* --------------------------------
     1. Check authentication
  --------------------------------- */

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return {
      message:
        "You must be logged in to complete onboarding.",
      errors: {},
    };
  }

  const userId = claimsData.claims.sub;

  /* --------------------------------
     2. Validate form data
  --------------------------------- */

  const parsed = onboardingSchema.safeParse({
    fullName: formData.get("full_name"),
    phone: formData.get("phone"),
    studentNumber: formData.get("student_number"),
    departmentId: formData.get("department_id"),
    programId: formData.get("program_id"),
    semesterId: formData.get("semester_id"),
    enrollmentYear: formData.get(
      "enrollment_year",
    ),
  });

  if (!parsed.success) {
    return {
      message: "Please correct the errors below.",
      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  const {
    fullName,
    phone,
    studentNumber,
    departmentId,
    programId,
    semesterId,
    enrollmentYear,
  } = parsed.data;

  /* --------------------------------
     3. Check existing student profile
  --------------------------------- */

  const {
    data: existingStudent,
    error: existingStudentError,
  } = await supabase
    .from("students")
    .select("id, student_number, profile_id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (existingStudentError) {
    console.error(
      "Existing student check error:",
      existingStudentError,
    );

    return {
      message:
        "Unable to check your existing student profile.",
      errors: {},
    };
  }

  if (existingStudent) {
    redirect("/dashboard");
  }

  /* --------------------------------
     4. Check duplicate student number
  --------------------------------- */

  const {
    data: existingStudentByNumber,
    error: studentNumberCheckError,
  } = await supabase
    .from("students")
    .select("id, profile_id, student_number")
    .eq("student_number", studentNumber)
    .maybeSingle();

  if (studentNumberCheckError) {
    console.error(
      "Student number check error:",
      studentNumberCheckError,
    );

    return {
      message:
        "Unable to verify your student number.",
      errors: {},
    };
  }

  if (existingStudentByNumber) {
    if (
      existingStudentByNumber.profile_id ===
      userId
    ) {
      redirect("/dashboard");
    }

    return {
      message:
        "This student number is already registered.",
      errors: {
        studentNumber: [
          "This student number is already registered.",
        ],
      },
    };
  }

  /* --------------------------------
     5. Validate department
  --------------------------------- */

  const {
    data: department,
    error: departmentError,
  } = await supabase
    .from("departments")
    .select("id, name, code")
    .eq("id", departmentId)
    .maybeSingle();

  if (departmentError || !department) {
    console.error(
      "Department validation error:",
      departmentError,
    );

    return {
      message:
        "The selected department is invalid.",
      errors: {
        departmentId: [
          "Please select a valid department.",
        ],
      },
    };
  }

  /* --------------------------------
     6. Validate program
        and department relationship
  --------------------------------- */

  const {
    data: program,
    error: programError,
  } = await supabase
    .from("programs")
    .select(
      "id, name, code, department_id",
    )
    .eq("id", programId)
    .maybeSingle();

  if (programError || !program) {
    console.error(
      "Program validation error:",
      programError,
    );

    return {
      message:
        "The selected program is invalid.",
      errors: {
        programId: [
          "Please select a valid program.",
        ],
      },
    };
  }

  if (
    program.department_id !== departmentId
  ) {
    return {
      message:
        "The selected program does not belong to the selected department.",
      errors: {
        programId: [
          "Please select a valid program for this department.",
        ],
      },
    };
  }

  /* --------------------------------
     7. Validate semester
        and program relationship
  --------------------------------- */

  const {
    data: semester,
    error: semesterError,
  } = await supabase
    .from("semesters")
    .select(
      "id, program_id, semester_number, academic_year",
    )
    .eq("id", semesterId)
    .maybeSingle();

  if (semesterError || !semester) {
    console.error(
      "Semester validation error:",
      semesterError,
    );

    return {
      message:
        "The selected semester is invalid.",
      errors: {
        semesterId: [
          "Please select a valid semester.",
        ],
      },
    };
  }

  if (
    semester.program_id !== programId
  ) {
    return {
      message:
        "The selected semester does not belong to the selected program.",
      errors: {
        semesterId: [
          "Please select a valid semester for this program.",
        ],
      },
    };
  }

  /* --------------------------------
     8. Check profile exists
  --------------------------------- */

  const {
    data: profile,
    error: profileCheckError,
  } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileCheckError || !profile) {
    console.error(
      "Profile check error:",
      profileCheckError,
    );

    return {
      message:
        "Your profile could not be found. Please sign in again.",
      errors: {},
    };
  }

  /* --------------------------------
     9. Update profile
  --------------------------------- */

  const {
    error: profileUpdateError,
  } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
    })
    .eq("id", userId);

  if (profileUpdateError) {
    console.error(
      "Profile update error:",
      profileUpdateError,
    );

    return {
      message:
        "Unable to update your profile.",
      errors: {},
    };
  }

  /* --------------------------------
     10. Create student record
  --------------------------------- */

  const {
    error: studentError,
  } = await supabase
    .from("students")
    .insert({
      profile_id: userId,
      student_number: studentNumber,
      program_id: programId,
      semester_id: semesterId,
      enrollment_year: enrollmentYear,
      current_semester:
        semester.semester_number,
    });

  if (studentError) {
    console.error(
      "Student creation error:",
      studentError,
    );

    if (studentError.code === "23505") {
      return {
        message:
          "This student information is already registered.",
        errors: {
          studentNumber: [
            "This student number or student profile is already registered.",
          ],
        },
      };
    }

    return {
      message:
        "Unable to save your student information. Please try again.",
      errors: {},
    };
  }

  /* --------------------------------
     11. Success
  --------------------------------- */

  redirect("/dashboard");
}