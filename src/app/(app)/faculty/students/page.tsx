import { Card } from "@/components/ui/card";

import { getFacultyStudents } from "@/services/faculty/faculty-data";

export default async function FacultyStudentsPage() {
  const students =
    await getFacultyStudents();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Teaching
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Students
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Students enrolled in your assigned subjects.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-5 py-4 text-left">
                  Student
                </th>

                <th className="px-5 py-4 text-left">
                  Student ID
                </th>

                <th className="px-5 py-4 text-left">
                  Semester
                </th>

                <th className="px-5 py-4 text-left">
                  Subjects
                </th>

                <th className="px-5 py-4 text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {students.map(
                (student) => (
                  <tr
                    key={student.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {student.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {student.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {student.studentNumber}
                    </td>

                    <td className="px-5 py-4">
                      {student.semester
                        ? `Semester ${student.semester}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      {student.subjects.length}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Enrolled
                      </span>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No students found for your assigned subjects.
          </div>
        )}
      </Card>
    </div>
  );
}