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

      {/* CampusMate AI */}
      <section className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">
              CampusMate AI
            </p>

            <h2 className="mt-1 text-xl font-bold text-foreground">
              Your academic assistant is ready.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Ask about your exams, assignments, attendance,
              syllabus progress or what you should study next.
            </p>
          </div>

          <a
            href="/ai"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Ask CampusMate AI
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-sm font-semibold text-brand-600">
        Campus Search
      </p>

      <h2 className="mt-1 text-xl font-bold text-foreground">
        Find anything across CampusMate.
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Search your subjects, assignments,
        notices, timetable and study plans
        from one place.
      </p>
    </div>

    <a
      href="/search"
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
    >
      Search Campus
    </a>
  </div>
</section>

      <section className="rounded-2xl border border-border bg-card p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-sm font-semibold text-brand-600">
        Academic Intelligence
      </p>

      <h2 className="mt-1 text-xl font-bold">
        Understand your academic health
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        CampusMate analyzes attendance, assignments,
        syllabus progress, study consistency and exam
        readiness to identify where you should focus next.
      </p>
    </div>

    <a
      href="/academic-health"
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
    >
      View Academic Health
    </a>
  </div>
</section>

      {/* Academic summary */}
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

      {/* Next class */}
      <NextClassCard />

      {/* Today's schedule and assignments */}
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <TodaySchedule items={[]} />

        <UpcomingAssignments assignments={[]} />
      </section>

      {/* Attendance and academic health */}
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

      {/* Notifications */}
      <DashboardNotifications notifications={[]} />
    </main>
  );
}