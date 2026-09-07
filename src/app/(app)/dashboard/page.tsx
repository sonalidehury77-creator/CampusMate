import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const claims = claimsError
    ? null
    : claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  const userId = claims.sub;

  const userEmail =
    typeof claims.email === "string"
      ? claims.email
      : null;

  const { data: profile, error } =
    await supabase
      .from("profiles")
      .select(
        "id, full_name, email, role",
      )
      .eq("id", userId)
      .single();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-brand-600">
          CampusMate Dashboard
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome
              {profile?.full_name
                ? `, ${profile.full_name}`
                : ""}
              !
            </h1>

            <p className="mt-2 text-slate-500">
              Here is your CampusMate overview.
            </p>
          </div>

          <Badge variant="success">
            Account active
          </Badge>
        </div>
      </section>

      {error && (
        <Card>
          <CardContent>
            <p className="text-sm text-danger-700">
              Profile could not be loaded:{" "}
              {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">
              Email
            </p>

            <p className="mt-2 truncate font-semibold text-slate-900">
              {profile?.email ??
                userEmail ??
                "Not available"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">
              Role
            </p>

            <div className="mt-2">
              <Badge>
                {profile?.role ?? "student"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">
              Account ID
            </p>

            <p className="mt-2 truncate text-xs text-slate-700">
              {userId}
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-slate-900">
              Your CampusMate workspace
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Your academic information, timetable,
              assignments, attendance, resources,
              notices, study planning, and AI
              assistance will appear here as we build
              each module.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}