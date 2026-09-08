
"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";

import {
  completeOnboarding,
  type OnboardingState,
} from "./actions";

type Department = {
  id: string;
  name: string;
  code: string;
};

type Program = {
  id: string;
  department_id: string;
  name: string;
  code: string;
  duration: number | null;
};

type Semester = {
  id: string;
  program_id: string;
  semester_number: number;
  academic_year: string;
};

type OnboardingFormProps = {
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  departments: Department[];
  programs: Program[];
  semesters: Semester[];
};

const initialOnboardingState: OnboardingState = {
  message: null,
  errors: {},
};

export default function OnboardingForm({
  profile,
  departments,
  programs,
  semesters,
}: OnboardingFormProps) {
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState(
    profile?.full_name ?? "",
  );

  const [phone, setPhone] = useState(
    profile?.phone ?? "",
  );

  const [studentNumber, setStudentNumber] =
    useState("");

  const defaultDepartment =
    departments.find(
      (department) => department.code === "CS",
    ) ?? departments[0];

  const [departmentId, setDepartmentId] =
    useState(defaultDepartment?.id ?? "");

  const availablePrograms = useMemo(() => {
    if (!departmentId) {
      return [];
    }

    return programs.filter(
      (program) =>
        program.department_id === departmentId,
    );
  }, [programs, departmentId]);

  const defaultProgram =
    availablePrograms.find(
      (program) => program.code === "BSC-CS",
    ) ?? availablePrograms[0];

  const [programId, setProgramId] =
    useState(defaultProgram?.id ?? "");

  const availableSemesters = useMemo(() => {
    if (!programId) {
      return [];
    }

    return semesters
      .filter(
        (semester) =>
          semester.program_id === programId,
      )
      .sort(
        (a, b) =>
          a.semester_number -
          b.semester_number,
      );
  }, [semesters, programId]);

  const [semesterId, setSemesterId] =
    useState("");

  const currentYear = new Date().getFullYear();

  const [enrollmentYear, setEnrollmentYear] =
    useState(String(currentYear));

  const [state, formAction, isPending] =
    useActionState(
      completeOnboarding,
      initialOnboardingState,
    );

  const errors = state?.errors ?? {};

  const handleDepartmentChange = (
    value: string,
  ) => {
    setDepartmentId(value);

    const firstProgram = programs.find(
      (program) =>
        program.department_id === value,
    );

    setProgramId(firstProgram?.id ?? "");
    setSemesterId("");
  };

  const handleProgramChange = (
    value: string,
  ) => {
    setProgramId(value);
    setSemesterId("");
  };

  const handleContinue = () => {
    if (!fullName.trim()) {
      return;
    }

    if (!studentNumber.trim()) {
      return;
    }

    setStep(2);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Progress indicator */}

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {/* Step 1 */}

          <div
            className={`flex items-center gap-3 ${
              step >= 1
                ? "text-blue-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${
                step >= 1
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              1
            </div>

            <div>
              <p className="font-semibold">
                Personal
              </p>

              <p className="text-xs text-gray-500">
                Basic information
              </p>
            </div>
          </div>

          {/* Progress line */}

          <div className="mx-4 h-px flex-1 bg-gray-200" />

          {/* Step 2 */}

          <div
            className={`flex items-center gap-3 ${
              step >= 2
                ? "text-blue-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${
                step >= 2
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              2
            </div>

            <div>
              <p className="font-semibold">
                Academic
              </p>

              <p className="text-xs text-gray-500">
                Course information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Server message */}

      {state?.message && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* Form */}

      <form action={formAction}>
        {/* ================================
            STEP 1
        ================================= */}

        {step === 1 && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Tell us a little about yourself.
              </p>
            </div>

            {/* Full Name */}

            <div className="mb-5">
              <label
                htmlFor="full_name"
                className="mb-2 block text-sm font-medium"
              >
                Full Name
              </label>

              <input
                id="full_name"
                name="full_name"
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Enter your full name"
                autoComplete="name"
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {errors.fullName?.[0] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fullName[0]}
                </p>
              )}
            </div>

            {/* Email */}

            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={profile?.email ?? ""}
                disabled
                className="w-full rounded-xl border bg-gray-50 px-4 py-3 text-gray-500"
              />

              <p className="mt-1 text-xs text-gray-500">
                Your email comes from your account and
                cannot be changed here.
              </p>
            </div>

            {/* Phone */}

            <div className="mb-5">
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium"
              >
                Phone Number
                <span className="ml-1 text-gray-400">
                  (Optional)
                </span>
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Enter your phone number"
                autoComplete="tel"
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {errors.phone?.[0] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone[0]}
                </p>
              )}
            </div>

            {/* Student Number */}

            <div className="mb-6">
              <label
                htmlFor="student_number"
                className="mb-2 block text-sm font-medium"
              >
                Student Number
              </label>

              <input
                id="student_number"
                name="student_number"
                type="text"
                value={studentNumber}
                onChange={(event) =>
                  setStudentNumber(
                    event.target.value,
                  )
                }
                placeholder="Enter your university student number"
                autoComplete="off"
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {errors.studentNumber?.[0] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.studentNumber[0]}
                </p>
              )}
            </div>

            {/* Continue */}

            <button
              type="button"
              onClick={handleContinue}
              disabled={
                !fullName.trim() ||
                !studentNumber.trim()
              }
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Continue
            </button>
          </div>
        )}

        {/* ================================
            STEP 2
        ================================= */}

        {step === 2 && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Academic Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select your department, program,
                semester and enrollment year.
              </p>
            </div>

            {/* Hidden Step 1 values */}

            <input
              type="hidden"
              name="full_name"
              value={fullName}
            />

            <input
              type="hidden"
              name="phone"
              value={phone}
            />

            <input
              type="hidden"
              name="student_number"
              value={studentNumber}
            />

            {/* Department */}

            <div className="mb-5">
              <label
                htmlFor="department_id"
                className="mb-2 block text-sm font-medium"
              >
                Department
              </label>

              <select
                id="department_id"
                name="department_id"
                value={departmentId}
                onChange={(event) =>
                  handleDepartmentChange(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select Department
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name} (
                      {department.code})
                    </option>
                  ),
                )}
              </select>

              {errors.departmentId?.[0] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.departmentId[0]}
                </p>
              )}
            </div>

            {/* Program */}

            <div className="mb-5">
              <label
                htmlFor="program_id"
                className="mb-2 block text-sm font-medium"
              >
                Program
              </label>

              <select
                id="program_id"
                name="program_id"
                value={programId}
                onChange={(event) =>
                  handleProgramChange(
                    event.target.value,
                  )
                }
                disabled={!departmentId}
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              >
                <option value="">
                  {departmentId
                    ? "Select Program"
                    : "Select Department First"}
                </option>

                {availablePrograms.map(
                  (program) => (
                    <option
                      key={program.id}
                      value={program.id}
                    >
                      {program.name} (
                      {program.code})
                    </option>
                  ),
                )}
              </select>

              {errors.programId?.[0] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.programId[0]}
                </p>
              )}
            </div>

            {/* Semester */}

            <div className="mb-5">
              <label
                htmlFor="semester_id"
                className="mb-2 block text-sm font-medium"
              >
                Current Semester
              </label>

              <select
                id="semester_id"
                name="semester_id"
                value={semesterId}
                onChange={(event) =>
                  setSemesterId(
                    event.target.value,
                  )
                }
                disabled={
                  !programId ||
                  availableSemesters.length === 0
                }
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              >
                <option value="">
                  {!programId
                    ? "Select Program First"
                    : availableSemesters.length === 0
                      ? "No Semesters Available"
                      : "Select Semester"}
                </option>

                {availableSemesters.map(
                  (semester) => (
                    <option
                      key={semester.id}
                      value={semester.id}
                    >
                      Semester{" "}
                      {semester.semester_number}{" "}
                      ({semester.academic_year})
                    </option>
                  ),
                )}
              </select>

              {errors.semesterId?.[0] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.semesterId[0]}
                </p>
              )}
            </div>

            {/* Enrollment Year */}

            <div className="mb-8">
              <label
                htmlFor="enrollment_year"
                className="mb-2 block text-sm font-medium"
              >
                Enrollment Year
              </label>

              <input
                id="enrollment_year"
                name="enrollment_year"
                type="number"
                min="2000"
                max="2100"
                value={enrollmentYear}
                onChange={(event) =>
                  setEnrollmentYear(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {errors.enrollmentYear?.[0] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.enrollmentYear[0]}
                </p>
              )}
            </div>

            {/* Buttons */}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isPending}
                className="w-full rounded-xl border px-5 py-3 font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={
                  isPending ||
                  !departmentId ||
                  !programId ||
                  !semesterId ||
                  !enrollmentYear
                }
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isPending
                  ? "Saving..."
                  : "Complete Setup"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
