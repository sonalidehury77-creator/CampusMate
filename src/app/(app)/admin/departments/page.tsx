import { getAdminDepartmentsData } from "@/services/admin/admin-data";

export default async function AdminDepartmentsPage() {
  const departments =
    await getAdminDepartmentsData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Academic Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Department Management
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          View the academic departments configured in CampusMate.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((department) => (
          <article
            key={department.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {department.code}
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              {department.name}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {department.description}
            </p>
          </article>
        ))}

        {departments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
            No departments have been configured yet.
          </div>
        )}
      </div>
    </div>
  );
}