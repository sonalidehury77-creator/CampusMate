import { createClient } from "@/lib/supabase/server";

export default async function SupabaseTestPage() {
  const supabase = await createClient();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  const { data: departments, error: departmentsError } = await supabase
    .from("departments")
    .select("id")
    .limit(1);

  const error = profilesError ?? departmentsError;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          CampusMate Database Test
        </h1>

        {error ? (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
            <p className="font-semibold">
              Database responded with an error
            </p>

            <p className="mt-2 text-sm">
              {error.message}
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-700">
            <p className="font-semibold">
              CampusMate database connection is working.
            </p>

            <p className="mt-2 text-sm">
              The required database tables are reachable.
            </p>

            <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <p>
                Profiles found: {profiles?.length ?? 0}
              </p>

              <p>
                Departments found: {departments?.length ?? 0}
              </p>

              <p className="mt-2">
                Empty results are normal because we have not populated
                CampusMate with academic data yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}