import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsError ? null : claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  const userId = claims.sub;
  const userEmail =
    typeof claims.email === "string" ? claims.email : null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", userId)
    .single();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">
            CampusMate Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Welcome
            {profile?.full_name
              ? `, ${profile.full_name}`
              : ""}
            !
          </h1>

          <p className="mt-3 text-gray-600">
            Your CampusMate account is authenticated.
          </p>

          {error ? (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              Profile could not be loaded: {error.message}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border p-4">
                <p className="text-sm text-gray-500">
                  Email
                </p>

                <p className="mt-1 font-medium">
                  {profile?.email ?? userEmail ?? "Not available"}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-gray-500">
                  Role
                </p>

                <p className="mt-1 font-medium capitalize">
                  {profile?.role ?? "student"}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-gray-500">
                  Auth ID
                </p>

                <p className="mt-1 truncate text-xs text-gray-700">
                  {userId}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}