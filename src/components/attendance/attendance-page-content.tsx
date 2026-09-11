import { AttendanceCalculator } from "@/components/attendance/attendance-calculator";
import { AttendanceList } from "@/components/attendance/attendance-list";
import { AttendanceSummary } from "@/components/attendance/attendance-summary";
import { SubjectAttendanceCard } from "@/components/attendance/subject-attendance-card";

import type { AttendanceData } from "@/types/attendance";

type AttendancePageContentProps = {
  data: AttendanceData;
};

export function AttendancePageContent({
  data,
}: AttendancePageContentProps) {
  return (
    <div className="space-y-8">
      <AttendanceSummary
        data={data}
      />

      <AttendanceCalculator
        summary={data.summary}
      />

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Subject-wise attendance
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Attendance by subject
          </h2>
        </div>

        {data.subjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-medium">
              No subject attendance available
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Subject attendance will appear
              after classes are recorded.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {data.subjects.map(
              (subject) => (
                <SubjectAttendanceCard
                  key={
                    subject.subjectId
                  }
                  subject={
                    subject
                  }
                />
              ),
            )}
          </div>
        )}
      </section>

      <AttendanceList
        records={
          data.recentRecords
        }
      />
    </div>
  );
}