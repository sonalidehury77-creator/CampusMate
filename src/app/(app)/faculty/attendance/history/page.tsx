import { Card } from "@/components/ui/card";

import {
  getFacultyAttendanceIntelligence,
} from "@/services/faculty/faculty-attendance-intelligence";

export default async function FacultyAttendanceHistoryPage() {
  const data =
    await getFacultyAttendanceIntelligence();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Teaching
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Attendance History
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Review attendance performance across your subjects and students.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">
            Student Attendance
          </h2>
        </div>

        <div className="divide-y">
          {data.students.map(
            (student) => (
              <div
                key={
                  student.studentId
                }
                className="flex flex-col gap-2 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {
                      student.name
                    }
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {
                      student.studentNumber
                    }
                  </p>
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="font-semibold">
                      {
                        student.attended
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Attended
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      {
                        student.counted
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Counted
                    </p>
                  </div>

                  <div>
                    <p
                      className={`font-semibold ${
                        student.percentage <
                        75
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {
                        student.percentage
                      }%
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Attendance
                    </p>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </Card>
    </div>
  );
}