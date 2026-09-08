import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();

  /* --------------------------------
     1. Check authentication
  --------------------------------- */

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const userId = claimsData.claims.sub;

  /* --------------------------------
     2. Get profile
  --------------------------------- */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "full_name, email, phone",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Profile loading error:",
      profileError,
    );

    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load your profile
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Please refresh the page and try again.
          </p>
        </div>
      </main>
    );
  }

  /* --------------------------------
     3. Check whether onboarding
        has already been completed
  --------------------------------- */

  const {
    data: existingStudent,
    error: studentCheckError,
  } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (studentCheckError) {
    console.error(
      "Student check error:",
      studentCheckError,
    );

    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to check your student profile
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Please refresh the page and try again.
          </p>
        </div>
      </main>
    );
  }

  if (existingStudent) {
    redirect("/dashboard");
  }

  /* --------------------------------
     4. Get departments
  --------------------------------- */

  const {
    data: departments,
    error: departmentsError,
  } = await supabase
    .from("departments")
    .select("id, name, code")
    .order("name");

  if (departmentsError) {
    console.error(
      "Departments loading error:",
      departmentsError,
    );

    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load departments
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Please refresh the page and try again.
          </p>
        </div>
      </main>
    );
  }

  /* --------------------------------
     5. Get programs
  --------------------------------- */

  const {
    data: programs,
    error: programsError,
  } = await supabase
    .from("programs")
    .select(
      "id, department_id, name, code, duration",
    )
    .order("name");

  if (programsError) {
    console.error(
      "Programs loading error:",
      programsError,
    );

    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load programs
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Please refresh the page and try again.
          </p>
        </div>
      </main>
    );
  }

  /* --------------------------------
     6. Get semesters
  --------------------------------- */

  const {
    data: semesters,
    error: semestersError,
  } = await supabase
    .from("semesters")
    .select(
      "id, program_id, semester_number, academic_year",
    )
    .order("semester_number");

  if (semestersError) {
    console.error(
      "Semesters loading error:",
      semestersError,
    );

    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-red-700">
            Unable to load semesters
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Please refresh the page and try again.
          </p>
        </div>
      </main>
    );
  }

  /* --------------------------------
     7. Check master data
  --------------------------------- */

  if (!departments?.length) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold">
            No departments available
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Please contact the administrator.
          </p>
        </div>
      </main>
    );
  }

  if (!programs?.length) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold">
            No programs available
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Please contact the administrator.
          </p>
        </div>
      </main>
    );
  }

  if (!semesters?.length) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold">
            No semesters available
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Please contact the administrator.
          </p>
        </div>
      </main>
    );
  }

  /* --------------------------------
     8. Render onboarding
  --------------------------------- */

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}

        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-sm">
            CM
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Complete Your Profile
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
            Welcome to CampusMate. Complete your
            profile to personalize your campus
            experience.
          </p>
        </div>

        {/* Form */}

        <OnboardingForm
          profile={{
            full_name:
              profile?.full_name ?? "",
            email:
              profile?.email ?? "",
            phone:
              profile?.phone ?? "",
          }}
          departments={departments ?? []}
          programs={programs ?? []}
          semesters={semesters ?? []}
        />
      </div>
    </main>
  );
}