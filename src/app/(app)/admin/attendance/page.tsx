import { Card } from "@/components/ui/card";

import {
  getAdminAttendanceIntelligence,
} from "@/services/admin/admin-attendance-intelligence";

export default async function AdminAttendancePage() {
  const data =
    await getAdminAttendanceIntelligence();

  const highRisk =
    data.studentRisk.filter(
      (student) =>
        student.riskLevel ===
        "high",
    );

  const mediumRisk =
    data.studentRisk.filter(
      (student) =>
        student.riskLevel ===
        "medium",
    );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Institution Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Attendance Risk Analytics
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Institution-wide attendance statistics calculated from live attendance records.
        </p>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Attendance Sessions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              data.totalSessions
            }
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Attendance Records
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              data.totalRecords
            }
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            High Risk
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {
              highRisk.length
            }
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Medium Risk
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-600">
            {
              mediumRisk.length
            }
          </p>
        </Card>
      </div>

      {/* =====================================================
          DEPARTMENT
      ====================================================== */}

      <Card className="overflow-hidden">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">
            Department Attendance
          </h2>
        </div>

        <div className="divide-y">
          {data.departmentAnalytics.map(
            (department) => (
              <div
                key={
                  department.departmentId
                }
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <p className="font-semibold">
                    {
                      department.departmentName
                    }
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {
                      department.subjects
                    }{" "}
                    subjects ·{" "}
                    {
                      department.sessions
                    }{" "}
                    sessions
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold">
                    {
                      department.attendance
                    }%
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {
                      department.studentsAtRisk
                    }{" "}
                    high-risk students
                  </p>
                </div>
              </div>
            ),
          )}

          {data.departmentAnalytics
            .length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No department attendance data available.
            </div>
          )}
        </div>
      </Card>

      {/* =====================================================
          SEMESTER
      ====================================================== */}

      <Card className="overflow-hidden">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">
            Semester Attendance
          </h2>
        </div>

        <div className="divide-y">
          {data.semesterAnalytics.map(
            (semester) => (
              <div
                key={
                  semester.semesterId
                }
                className="flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-medium">
                    Semester
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {
                      semester.subjects
                    }{" "}
                    subjects ·{" "}
                    {
                      semester.sessions
                    }{" "}
                    sessions
                  </p>
                </div>

                <p className="text-xl font-bold">
                  {
                    semester.attendance
                  }%
                </p>
              </div>
            ),
          )}
        </div>
      </Card>

      {/* =====================================================
          LOW ATTENDANCE SUBJECTS
      ====================================================== */}

      <Card className="overflow-hidden">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">
            Attendance Risk by Subject
          </h2>
        </div>

        <div className="divide-y">
          {data.subjectAnalytics.map(
            (subject) => (
              <div
                key={
                  subject.subjectId
                }
                className="flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-semibold">
                    {
                      subject.code
                    }{" "}
                    —{" "}
                    {
                      subject.name
                    }
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {
                      subject.sessions
                    }{" "}
                    sessions
                  </p>
                </div>

                <p
                  className={`text-xl font-bold ${
                    subject.attendance <
                    75
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {
                    subject.attendance
                  }%
                </p>
              </div>
            ),
          )}
        </div>
      </Card>

      {/* =====================================================
          AT-RISK STUDENTS
      ====================================================== */}

      <Card className="overflow-hidden">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">
            Attendance Risk Students
          </h2>
        </div>

        <div className="divide-y">
          {data.studentRisk
            .slice(0, 50)
            .map(
              (student) => (
                <div
                  key={
                    student.studentId
                  }
                  className="flex items-center justify-between p-5"
                >
                  <div>
                    <p className="font-medium">
                      Student
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

                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        student.riskLevel ===
                        "high"
                          ? "text-red-600"
                          : student.riskLevel ===
                              "medium"
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {
                        student.attendance
                      }%
                    </p>

                    <p className="text-xs capitalize text-muted-foreground">
                      {
                        student.riskLevel
                      }{" "}
                      risk
                    </p>
                  </div>
                </div>
              ),
            )}

          {data.studentRisk.length ===
            0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No student attendance data available.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}