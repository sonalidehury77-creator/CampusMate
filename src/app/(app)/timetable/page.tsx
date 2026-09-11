import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { FreePeriods } from "@/components/timetable/free-periods";
import { TimetableSummary } from "@/components/timetable/timetable-summary";
import { TodaySchedule } from "@/components/timetable/today-schedule";
import { WeeklyTimetable } from "@/components/timetable/weekly-timetable";
import { createClient } from "@/lib/supabase/server";
import { getTimetableData } from "@/services/timetable/timetable-data";

export default async function TimetablePage() {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const claims = claimsError
    ? null
    : claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  const data = await getTimetableData(
    claims.sub,
  );

  return (
    <main className="space-y-8">
      <PageHeader
        eyebrow="Academics"
        title="Smart timetable"
        description="See your classes, next session, free periods, rooms and faculty in one personalized schedule."
      />

      <TimetableSummary data={data} />

      <TodaySchedule data={data} />

      <FreePeriods
        periods={data.freePeriods}
      />

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Weekly view
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Your complete timetable
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            The schedule is loaded directly from your
            current semester data.
          </p>
        </div>

        <WeeklyTimetable data={data} />
      </section>
    </main>
  );
}