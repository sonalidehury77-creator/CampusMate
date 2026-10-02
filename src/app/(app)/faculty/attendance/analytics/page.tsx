import { Card } from "@/components/ui/card";

import {
  getFacultyAttendanceIntelligence,
} from "@/services/faculty/faculty-attendance-intelligence";

export default async function FacultyAttendanceAnalyticsPage() {
  const data =
    await getFacultyAttendanceIntelligence();

  const atRisk =
    data.students.filter(
      (student) =>
        student.status ===
        "risk",
    );

  const warning =
    data.students.filter(
      (student) =>
        student.status ===
        "warning",
    );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Teaching Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Attendance Analytics
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Live statistics calculated from your recorded attendance sessions.
        </p>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Sessions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              data.totalSessions
            }
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Students
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              data.students.length
            }
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Below 75%
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {
              atRisk.length
            }
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Warning
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-600">
            {
              warning.length
            }
          </p>
        </Card>
      </div>

      {/* SUBJECT STATISTICS */}

      <Card className="overflow-hidden">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">
            Subject-wise Statistics
          </h2>
        </div>

        <div className="divide-y">
          {data.subjects.map(
            (subject) => (
              <div
                key={
                  subject.subjectId
                }
                className="p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {
                        subject.subjectCode
                      }{" "}
                      —{" "}
                      {
                        subject.subjectName
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {
                        subject.totalSessions
                      }{" "}
                      sessions
                    </p>
                  </div>

                  <p
                    className={`text-xl font-bold ${
                      subject.percentage <
                      75
                        ? "text-red-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {
                      subject.percentage
                    }%
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </Card>

      {/* STUDENT STATISTICS */}

      <Card className="overflow-hidden">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">
            Student-wise Attendance
          </h2>
        </div>

        <div className="divide-y">
          {data.students.map(
            (student) => (
              <div
                key={
                  student.studentId
                }
                className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
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

                <div className="text-right">
                  <p
                    className={`font-bold ${
                      student.status ===
                      "risk"
                        ? "text-red-600"
                        : student.status ===
                            "warning"
                          ? "text-amber-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {
                      student.percentage
                    }%
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {
                      student.attended
                    }{" "}
                    attended /{" "}
                    {
                      student.counted
                    }{" "}
                    counted
                  </p>
                </div>
              </div>
            ),
          )}

          {data.students.length ===
            0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No student attendance records available yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}