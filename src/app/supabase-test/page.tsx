import { createClient } from "@/lib/supabase/server";

export default async function SupabaseTestPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Supabase Connection Test</h1>

        {error ? (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
            <p className="font-semibold">Supabase responded with an error:</p>
            <p className="mt-2 text-sm">{error.message}</p>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-700">
            <p className="font-semibold">
              Supabase connection is working.
            </p>

            <pre className="mt-3 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}