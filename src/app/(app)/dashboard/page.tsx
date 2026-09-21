import { redirect } from "next/navigation";

import { AcademicHealth } from "@/components/dashboard/academic-health";
import { AttendanceOverview } from "@/components/dashboard/attendance-overview";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { NextClassCard } from "@/components/dashboard/next-class-card";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { UpcomingAssignments } from "@/components/dashboard/upcoming-assignments";
import { OpportunityIntelligence } from "@/components/dashboard/opportunity-intelligence";
import { NextExamCard } from "@/components/exams/next-exam-card";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/services/dashboard/dashboard-data";
import { getExamsData } from "@/services/exams/exams-data";
import { getFinanceData } from "@/services/finance/finance-data";
import { generateMySmartReminders } from "@/services/notifications/reminder-engine";
import { getOpportunityDashboardData } from "@/services/opportunities/opportunity-dashboard";

export default async function DashboardPage() {
  // ============================================================
  // 1. CREATE SUPABASE SERVER CLIENT
  // ============================================================

  const supabase = await createClient();

  // ============================================================
  // 2. CHECK AUTHENTICATED SESSION
  // ============================================================

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const claims = claimsError ? null : claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  // ============================================================
  // 3. GENERATE SMART REMINDERS
  // ============================================================

  try {
    await generateMySmartReminders();
  } catch (error) {
    console.error(
      "Smart reminder generation failed:",
      error,
    );
  }

  // ============================================================
  // 4. LOAD DASHBOARD DATA
  // ============================================================

  const data = await getDashboardData(claims.sub);

  // ============================================================
  // 5. LOAD EXAM DATA
  // ============================================================

  const examData = await getExamsData();

  // ============================================================
  // 6. LOAD FINANCE DATA
  // ============================================================

  const financeData = await getFinanceData();

  // ============================================================
  // 7. LOAD OPPORTUNITY INTELLIGENCE DATA
  // ============================================================

  const opportunityData =
    await getOpportunityDashboardData();

  // ============================================================
  // 8. CALCULATE DAYS REMAINING FOR NEXT EXAM
  // ============================================================

  const daysRemaining = examData.nextExam
    ? Math.max(
        0,
        Math.round(
          (
            new Date(
              `${examData.nextExam.examDate}T00:00:00+05:30`,
            ).getTime() -
            new Date(
              `${new Intl.DateTimeFormat(
                "en-CA",
                {
                  timeZone: "Asia/Kolkata",
                },
              ).format(new Date())}T00:00:00+05:30`,
            ).getTime()
          ) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  // ============================================================
  // 9. LOAD TOP 5 UNREAD NOTIFICATIONS
  // ============================================================

  const {
    data: notificationRows,
    error: notificationError,
  } = await supabase
    .from("notifications")
    .select(
      `
        id,
        title,
        message,
        type,
        priority,
        related_entity_type,
        related_entity_id,
        read_at,
        created_at
      `,
    )
    .is("read_at", null)
    .order("created_at", {
      ascending: false,
    })
    .limit(5);

  if (notificationError) {
    console.error(
      "Failed to load dashboard notifications:",
      notificationError,
    );
  }

  // ============================================================
  // 10. CONVERT NOTIFICATIONS INTO DASHBOARD FORMAT
  // ============================================================

  const dashboardNotifications = (
    notificationRows ?? []
  ).map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    priority: notification.priority,
    relatedEntityType:
      notification.related_entity_type,
    relatedEntityId:
      notification.related_entity_id,
    readAt: notification.read_at,
    createdAt: notification.created_at,
  }));

  // ============================================================
  // 11. RENDER DASHBOARD
  // ============================================================

  return (
    <main className="space-y-6">
      {/* ======================================================
          Dashboard Header
      ====================================================== */}

      <DashboardHeader
        fullName={
          data.profile.full_name ?? "Student"
        }
      />

      {/* ======================================================
          CampusMate AI
      ====================================================== */}

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
              Ask about your exams, assignments,
              attendance, syllabus progress or what
              you should study next.
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

      {/* ======================================================
          Global Campus Search
      ====================================================== */}

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

      {/* ======================================================
          Academic Intelligence
      ====================================================== */}

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
              CampusMate analyzes attendance,
              assignments, syllabus progress, study
              consistency and exam readiness to
              identify where you should focus next.
            </p>
          </div>

          <a
            href="/academic-analytics"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            View Academic Analytics
          </a>
        </div>
      </section>

      {/* ======================================================
          Academic Summary
      ====================================================== */}

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

      {/* ======================================================
          Next Class
      ====================================================== */}

      <NextClassCard />

      {/* ======================================================
          Next Exam
      ====================================================== */}

      <NextExamCard
        exam={examData.nextExam}
        daysRemaining={daysRemaining}
      />

      {/* ======================================================
          Finance Intelligence
      ====================================================== */}

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">
              Finance Intelligence
            </p>

            <h2 className="mt-1 text-xl font-bold">
              ₹
              {financeData.summary.totalSpent.toFixed(
                0,
              )}{" "}
              spent this month
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Daily average: ₹
              {financeData.summary.averageDailySpend.toFixed(
                0,
              )}
              {" · "}
              Budget remaining: ₹
              {financeData.summary.remainingBudget.toFixed(
                0,
              )}
            </p>
          </div>

          <a
            href="/finance"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            View Finance
          </a>
        </div>
      </section>

      {/* ======================================================
          Career Intelligence
      ====================================================== */}

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">
              Career Intelligence
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Build your career before graduation.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Track your skills, projects,
              certifications and career goals,
              and discover what you should improve next.
            </p>
          </div>

          <a
            href="/career"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Open Career Center
          </a>
        </div>
      </section>

      {/* ======================================================
          Scholarship & Opportunities Intelligence
      ====================================================== */}

      <OpportunityIntelligence
        data={opportunityData}
      />

      {/* ======================================================
          Today's Schedule and Assignments
      ====================================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <TodaySchedule items={[]} />

        <UpcomingAssignments
          assignments={[]}
        />
      </section>

      {/* ======================================================
          Attendance and Academic Health
      ====================================================== */}

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

      {/* ======================================================
          Dashboard Notifications
      ====================================================== */}

      <DashboardNotifications
        notifications={
          dashboardNotifications
        }
      />
    </main>
  );
}