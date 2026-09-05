import { createClient } from "@/lib/supabase/server";

export default async function SupabaseTestPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("id, name, code")
    .limit(10);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          CampusMate Database Test
        </h1>

        <p className="mt-2 text-gray-600">
          Testing the connection between Next.js and Supabase.
        </p>

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            <p className="font-semibold">
              Database connection/query failed
            </p>

            <p className="mt-2 text-sm">
              {error.message}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-green-50 p-4 text-green-700">
            <p className="font-semibold">
              CampusMate database connection is working.
            </p>

            <pre className="mt-4 overflow-auto rounded-lg bg-white p-4 text-sm text-gray-800">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}