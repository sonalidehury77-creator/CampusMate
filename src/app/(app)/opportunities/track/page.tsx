import Link from "next/link";

import {
  removeOpportunityApplication,
  updateOpportunityApplication,
} from "@/app/(app)/opportunities/actions";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";

type OpportunityApplication = {
  id: string;
  status: string;
  notes: string | null;
  applied_at: string | null;
  opportunity_id: string;
  opportunity: {
    id: string;
    title: string;
    opportunity_type: string;
    deadline: string | null;
    provider_name: string | null;
  } | null;
};

async function getApplications(): Promise<
  OpportunityApplication[]
> {
  const supabase = await createClient();

  // ============================================================
  // 1. GET AUTHENTICATED USER
  // ============================================================

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  // ============================================================
  // 2. FIND STUDENT RECORD
  // ============================================================

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (studentError) {
    throw new Error(
      studentError.message,
    );
  }

  if (!student) {
    throw new Error(
      "Student profile was not found.",
    );
  }

  // ============================================================
  // 3. LOAD APPLICATIONS
  //
  // We intentionally query the applications and opportunities
  // separately. This avoids Supabase nested-relation TypeScript
  // inference problems.
  // ============================================================

  const {
    data: applicationRows,
    error: applicationError,
  } = await supabase
    .from("opportunity_applications")
    .select(
      `
        id,
        status,
        notes,
        applied_at,
        opportunity_id
      `,
    )
    .eq("student_id", student.id)
    .order("updated_at", {
      ascending: false,
    });

  if (applicationError) {
    throw new Error(
      applicationError.message,
    );
  }

  const applications = applicationRows ?? [];

  if (applications.length === 0) {
    return [];
  }

  // ============================================================
  // 4. GET OPPORTUNITY IDS
  // ============================================================

  const opportunityIds = Array.from(
    new Set(
      applications.map(
        (application) =>
          application.opportunity_id,
      ),
    ),
  );

  // ============================================================
  // 5. LOAD OPPORTUNITY DETAILS
  // ============================================================

  const {
    data: opportunityRows,
    error: opportunityError,
  } = await supabase
    .from("opportunities")
    .select(
      `
        id,
        title,
        opportunity_type,
        deadline,
        provider_name
      `,
    )
    .in("id", opportunityIds);

  if (opportunityError) {
    throw new Error(
      opportunityError.message,
    );
  }

  const opportunityMap = new Map(
    (opportunityRows ?? []).map(
      (opportunity) => [
        opportunity.id,
        {
          id: opportunity.id,
          title: opportunity.title,
          opportunity_type:
            opportunity.opportunity_type,
          deadline:
            opportunity.deadline,
          provider_name:
            opportunity.provider_name,
        },
      ],
    ),
  );

  // ============================================================
  // 6. COMBINE APPLICATION + OPPORTUNITY DATA
  // ============================================================

  return applications.map(
    (application) => ({
      id: application.id,
      status: application.status,
      notes: application.notes,
      applied_at:
        application.applied_at,
      opportunity_id:
        application.opportunity_id,
      opportunity:
        opportunityMap.get(
          application.opportunity_id,
        ) ?? null,
    }),
  );
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Not applied yet";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
    },
  ).format(new Date(value));
}

export default async function OpportunityTrackerPage() {
  const applications =
    await getApplications();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Opportunity Application Tracker"
        description="Track saved opportunities, submitted applications and their progress from one place."
      />

      {/* ======================================================
          STATUS SUMMARY
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          "saved",
          "applied",
          "shortlisted",
          "selected",
        ].map((status) => (
          <div
            key={status}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm capitalize text-slate-500">
              {status}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {
                applications.filter(
                  (item) =>
                    item.status ===
                    status,
                ).length
              }
            </p>
          </div>
        ))}
      </div>

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {applications.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            No tracked opportunities yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Save an opportunity or mark one as
            applied to start tracking it.
          </p>

          <Link
            href="/opportunities"
            className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Browse Opportunities
          </Link>
        </section>
      ) : (
        /* ====================================================
           APPLICATION LIST
        ==================================================== */

        <section className="space-y-4">
          {applications.map(
            (application) => {
              const opportunity =
                application.opportunity;

              if (!opportunity) {
                return null;
              }

              return (
                <article
                  key={application.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                        {
                          opportunity.opportunity_type
                        }
                      </span>

                      <h2 className="mt-3 text-xl font-bold text-slate-900">
                        {
                          opportunity.title
                        }
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          opportunity.provider_name ??
                          "Provider not specified"
                        }
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                        <span>
                          Deadline:{" "}
                          <strong>
                            {formatDate(
                              opportunity.deadline,
                            )}
                          </strong>
                        </span>

                        <span>
                          Applied:{" "}
                          <strong>
                            {formatDate(
                              application.applied_at,
                            )}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/opportunities/${opportunity.id}`}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Opportunity
                    </Link>
                  </div>

                  {/* ==================================================
                      APPLICATION CONTROLS
                  ================================================== */}

                  <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr_auto]">
                    <form
                      action={
                        updateOpportunityApplication
                      }
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={
                          application.id
                        }
                      />

                      <select
                        name="status"
                        defaultValue={
                          application.status
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      >
                        <option value="saved">
                          Saved
                        </option>

                        <option value="applied">
                          Applied
                        </option>

                        <option value="shortlisted">
                          Shortlisted
                        </option>

                        <option value="selected">
                          Selected
                        </option>

                        <option value="rejected">
                          Rejected
                        </option>

                        <option value="withdrawn">
                          Withdrawn
                        </option>
                      </select>

                      <textarea
                        name="notes"
                        defaultValue={
                          application.notes ??
                          ""
                        }
                        placeholder="Application notes..."
                        className="mt-3 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                      />

                      <button
                        type="submit"
                        className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                      >
                        Update
                      </button>
                    </form>

                    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                      <p className="font-semibold text-slate-900">
                        Application progress
                      </p>

                      <p className="mt-2 leading-6">
                        Keep your status updated so
                        CampusMate can understand your
                        active opportunities and future
                        career activity.
                      </p>
                    </div>

                    <form
                      action={
                        removeOpportunityApplication
                      }
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={
                          application.id
                        }
                      />

                      <button
                        type="submit"
                        className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </article>
              );
            },
          )}
        </section>
      )}
    </div>
  );
}