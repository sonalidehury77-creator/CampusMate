import { getAdminFacultyData } from "@/services/admin/admin-data";

export default async function AdminFacultyPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";

  const faculty = await getAdminFacultyData();

  const filteredFaculty = query
    ? faculty.filter(
        (member) =>
          member.fullName
            .toLowerCase()
            .includes(query) ||
          member.email
            .toLowerCase()
            .includes(query) ||
          member.employeeId
            .toLowerCase()
            .includes(query),
      )
    : faculty;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Faculty Management
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Review registered teaching staff and their
          academic identities.
        </p>
      </div>

      <form className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search by faculty name, email or employee ID..."
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Faculty
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Employee ID
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Department
                </th>

                <th className="px-5 py-4 text-left font-semibold text-slate-600">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredFaculty.map((member) => (
                <tr
                  key={member.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {member.fullName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {member.email}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {member.employeeId}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {member.departmentId}
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {new Date(
                      member.createdAt,
                    ).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}

              {filteredFaculty.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No faculty members matched your search.
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