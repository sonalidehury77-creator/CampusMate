import { getAdminStudentsData } from "@/services/admin/admin-data";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";

  const students = await getAdminStudentsData();

  const filteredStudents = query
    ? students.filter(
        (student) =>
          student.fullName
            .toLowerCase()
            .includes(query) ||
          student.email
            .toLowerCase()
            .includes(query) ||
          student.studentNumber
            .toLowerCase()
            .includes(query),
      )
    : students;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Student Management
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Search and inspect registered CampusMate students.
        </p>
      </div>

      <form className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search by name, email or student number..."
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Student
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Student No.
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Program
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Semester
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {student.fullName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {student.email}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {student.studentNumber}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {student.programId}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {student.semesterId}
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {new Date(
                      student.createdAt,
                    ).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No students matched your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}