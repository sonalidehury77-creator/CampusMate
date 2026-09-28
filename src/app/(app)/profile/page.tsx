import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

import { getProfilePageData } from "@/services/profile/profile-data";

import { ProfileForm } from "./profile-form";

import Image from "next/image";

export default async function ProfilePage() {
  const data = await getProfilePageData();

  if (!data.user.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="My Profile"
        description="Manage your personal information, academic details, account security, privacy, and notification preferences."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* -------------------------------------------------- */}
        {/* PROFILE CARD */}
        {/* -------------------------------------------------- */}

        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {/* Profile image / fallback */}
            {data.profile.avatarUrl ? (
              <div className="size-24 overflow-hidden rounded-full border border-border bg-muted">
               <Image
  src={data.profile.avatarUrl}
  alt={`${data.profile.fullName || "Student"}'s profile`}
  width={96}
  height={96}
  className="h-full w-full object-cover"
/>
              </div>
            ) : (
              <div className="flex size-24 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
                {(
                  data.profile.fullName
                    ?.trim()
                    ?.charAt(0) ?? "S"
                ).toUpperCase()}
              </div>
            )}

            <h2 className="mt-4 text-xl font-semibold">
              {data.profile.fullName || "Student"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {data.profile.email}
            </p>

            <span className="mt-3 rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
              {data.profile.role}
            </span>
          </div>
        </Card>

        {/* -------------------------------------------------- */}
        {/* PROFILE FORM */}
        {/* -------------------------------------------------- */}

        <Card className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Update your personal information and manage your
              CampusMate account settings.
            </p>
          </div>

          <ProfileForm initialData={data} />
        </Card>
      </div>

      {/* -------------------------------------------------- */}
      {/* ACADEMIC INFORMATION */}
      {/* -------------------------------------------------- */}

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Academic Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your academic information is linked to your student
            record.
          </p>
        </div>

        {data.academic ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AcademicItem
              label="Student Number"
              value={data.academic.studentId}
            />

            <AcademicItem
              label="Department"
              value={
                data.academic.departmentName !== "—"
                  ? `${data.academic.departmentName}${
                      data.academic.departmentCode !== "—"
                        ? ` (${data.academic.departmentCode})`
                        : ""
                    }`
                  : "Not available"
              }
            />

            <AcademicItem
              label="Program"
              value={
                data.academic.programName !== "—"
                  ? `${data.academic.programName}${
                      data.academic.programCode !== "—"
                        ? ` (${data.academic.programCode})`
                        : ""
                    }`
                  : "Not available"
              }
            />

            <AcademicItem
              label="Current Semester"
              value={
                data.academic.semesterNumber !== null
                  ? `Semester ${data.academic.semesterNumber}`
                  : data.academic.currentSemester !== null
                    ? `Semester ${data.academic.currentSemester}`
                    : "Not available"
              }
            />

            <AcademicItem
              label="Academic Year"
              value={data.academic.academicYear}
            />

            <AcademicItem
              label="Enrollment Year"
              value={
                data.academic.enrollmentYear !== null
                  ? String(data.academic.enrollmentYear)
                  : "Not available"
              }
            />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/40 p-5">
            <p className="text-sm text-muted-foreground">
              Academic information is not available yet.
            </p>
          </div>
        )}
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