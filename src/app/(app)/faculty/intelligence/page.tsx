import { Card } from "@/components/ui/card";

import {
  getFacultyIntelligence,
} from "@/services/faculty/faculty-intelligence";

export default async function FacultyIntelligencePage() {
  const data =
    await getFacultyIntelligence();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          CampusMate Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Faculty Intelligence
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Early academic risk detection based on attendance,
          progress and assignment activity.
        </p>
      </div>

      {/* Insights */}

      <div className="grid gap-4 md:grid-cols-2">
        {data.insights.map(
          (insight) => (
            <Card
              key={insight}
              className="p-5"
            >
              <p className="text-sm font-medium">
                {insight}
              </p>
            </Card>
          ),
        )}
      </div>

      {/* Risk table */}

      <Card className="overflow-hidden">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">
            At-Risk Students
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Students requiring closer academic monitoring.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-5 py-4 text-left">
                  Student
                </th>

                <th className="px-5 py-4 text-left">
                  Attendance
                </th>

                <th className="px-5 py-4 text-left">
                  Progress
                </th>

                <th className="px-5 py-4 text-left">
                  Overdue
                </th>

                <th className="px-5 py-4 text-left">
                  Risk
                </th>
              </tr>
            </thead>

            <tbody>
              {data.atRiskStudents.map(
                (student) => (
                  <tr
                    key={student.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-5 py-4 font-medium">
                      {student.name}
                    </td>

                    <td className="px-5 py-4">
                      {student.attendance}%
                    </td>

                    <td className="px-5 py-4">
                      {student.averageProgress}%
                    </td>

                    <td className="px-5 py-4">
                      {
                        student.overdueAssignments
                      }
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          student.riskLevel ===
                          "high"
                            ? "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                            : student.riskLevel ===
                                "medium"
                              ? "rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                              : "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                        }
                      >
                        {
                          student.riskLevel
                        }
                      </span>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        {data.atRiskStudents.length ===
          0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No students require attention yet.
          </div>
        )}
      </Card>
    </div>
  );
}