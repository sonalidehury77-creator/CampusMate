import { redirect } from "next/navigation";

import { AcademicHealth } from "@/components/dashboard/academic-health";
import { AttendanceOverview } from "@/components/dashboard/attendance-overview";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { NextClassCard } from "@/components/dashboard/next-class-card";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { UpcomingAssignments } from "@/components/dashboard/upcoming-assignments";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/services/dashboard/dashboard-data";

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

  const data = await getDashboardData(claims.sub);

  return (
    <main className="space-y-6">
      <DashboardHeader
        fullName={data.profile.full_name ?? "Student"}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Current semester"
          value={
            data.semester
              ? `Semester ${data.semester.semester_number}`
              : "—"
          }
          description={
            data.semester?.academic_year ??
            "Academic information"
          }
          icon="🎓"
        />

        <DashboardStatCard
          title="Program"
          value={data.program?.code ?? "—"}
          description={
            data.program?.name ??
            "Program information"
          }
          icon="📚"
        />

        <DashboardStatCard
          title="Student number"
          value={data.student.student_number}
          description="Your academic identity"
          icon="🪪"
        />

        <DashboardStatCard
          title="Department"
          value={data.department?.code ?? "—"}
          description={
            data.department?.name ??
            "Department information"
          }
          icon="🏫"
        />
      </section>

      <NextClassCard />

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <TodaySchedule items={[]} />

        <UpcomingAssignments assignments={[]} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <AttendanceOverview
          overallPercentage={null}
          subjects={[]}
        />

        <AcademicHealth
          attendance={null}
          assignmentCompletion={null}
          studyProgress={null}
        />
      </section>

      <DashboardNotifications notifications={[]} />
    </main>
  );
}