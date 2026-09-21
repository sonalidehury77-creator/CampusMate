import Link from "next/link";

import type { OpportunityDashboardData } from "@/services/opportunities/opportunity-dashboard";

type OpportunityIntelligenceProps = {
  data: OpportunityDashboardData;
};

export function OpportunityIntelligence({
  data,
}: OpportunityIntelligenceProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">
              Scholarships & Opportunities
            </p>

            <h2 className="mt-1 text-xl font-bold text-foreground">
              Discover opportunities that can
              move you forward.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Track scholarships, internships,
              fellowships and other opportunities
              from your CampusMate dashboard.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Browse Opportunities
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Saved
            </p>

            <p className="mt-1 text-2xl font-bold text-foreground">
              {data.savedCount}
            </p>
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Active Applications
            </p>

            <p className="mt-1 text-2xl font-bold text-foreground">
              {data.appliedCount}
            </p>
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Deadlines in 30 Days
            </p>

            <p className="mt-1 text-2xl font-bold text-foreground">
              {data.upcomingDeadlines}
            </p>
          </div>
        </div>

        {data.topMatches.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                Recommended opportunities
              </h3>

              <Link
                href="/opportunities"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {data.topMatches.map(
                (opportunity) => (
                  <Link
                    key={opportunity.id}
                    href={`/opportunities/${opportunity.id}`}
                    className="block rounded-xl border border-border p-4 transition hover:border-brand-300 hover:bg-brand-50/30"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground">
                          {
                            opportunity.title
                          }
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {
                            opportunity.opportunityType
                          }
                        </p>
                      </div>

                      {opportunity.isVerified && (
                        <span className="w-fit rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Verified
                        </span>
                      )}
                    </div>

                    {opportunity.deadline && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Deadline:{" "}
                        {new Intl.DateTimeFormat(
                          "en-IN",
                          {
                            dateStyle:
                              "medium",
                          },
                        ).format(
                          new Date(
                            opportunity.deadline,
                          ),
                        )}
                      </p>
                    )}
                  </Link>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}