import { getAdminSubjectsData } from "@/services/admin/admin-data";

export default async function AdminSubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";

  const subjects = await getAdminSubjectsData();

  const filteredSubjects = query
    ? subjects.filter(
        (subject) =>
          subject.name
            .toLowerCase()
            .includes(query) ||
          subject.code
            .toLowerCase()
            .includes(query),
      )
    : subjects;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Academic Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Subject Management
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Review the academic subjects available in CampusMate.
        </p>
      </div>

      <form className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search subject name or code..."
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </form>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredSubjects.map((subject) => (
          <article
            key={subject.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-950">
                  {subject.name}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {subject.code}
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {subject.credits} credits
              </span>
            </div>

            <div className="mt-5 space-y-2 text-xs text-slate-500">
              <p>
                Department:{" "}
                <span className="font-medium text-slate-700">
                  {subject.departmentId}
                </span>
              </p>

              <p>
                Program:{" "}
                <span className="font-medium text-slate-700">
                  {subject.programId}
                </span>
              </p>

              <p>
                Semester:{" "}
                <span className="font-medium text-slate-700">
                  {subject.semesterId}
                </span>
              </p>
            </div>
          </article>
        ))}

        {filteredSubjects.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
            No subjects matched your search.
          </div>
        )}
      </div>
    </div>
  );
}