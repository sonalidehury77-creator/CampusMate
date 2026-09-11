import { PageHeader } from "@/components/layout/page-header";
import { AttendancePageContent } from "@/components/attendance/attendance-page-content";
import { createClient } from "@/lib/supabase/server";
import { getAttendanceData } from "@/services/attendance/attendance-data";

export const dynamic =
  "force-dynamic";

export default async function AttendancePage() {
  const supabase =
    await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const claims =
    claimsError
      ? null
      : claimsData?.claims;

  if (!claims?.sub) {
    return null;
  }

  const data =
    await getAttendanceData(
      claims.sub,
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academics"
        title="Attendance"
        description="Monitor your attendance, identify subjects that need attention, and plan upcoming classes intelligently."
      />

      <AttendancePageContent
        data={data}
      />
    </div>
  );
}