import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { getOpportunitiesData } from "@/services/opportunities/opportunities-data";
import type { OpportunityType } from "@/types/opportunities";

type OpportunitiesPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
};

const opportunityTypes: Array<{
  value: OpportunityType;
  label: string;
}> = [
  {
    value: "scholarship",
    label: "Scholarships",
  },
  {
    value: "internship",
    label: "Internships",
  },
  {
    value: "hackathon",
    label: "Hackathons",
  },
  {
    value: "competition",
    label: "Competitions",
  },
  {
    value: "workshop",
    label: "Workshops",
  },
  {
    value: "certification",
    label: "Certifications",
  },
  {
    value: "placement",
    label: "Placements",
  },
  {
    value: "government",
    label: "Government",
  },
  {
    value: "fellowship",
    label: "Fellowships",
  },
  {
    value: "research",
    label: "Research",
  },
];

function formatDeadline(
  deadline: string | null,
) {
  if (!deadline) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
    },
  ).format(
    new Date(deadline),
  );
}

function getDeadlineLabel(
  days: number | null,
) {
  if (days === null) {
    return "No deadline";
  }

  if (days < 0) {
    return "Closed";
  }

  if (days === 0) {
    return "Due today";
  }

  if (days === 1) {
    return "1 day left";
  }

  return `${days} days left`;
}

export default async function OpportunitiesPage({
  searchParams,
}: OpportunitiesPageProps) {
  const params =
    await searchParams;

  const query =
    params.q ?? "";

  const type =
    params.type ?? "all";

  const data =
    await getOpportunitiesData(
      query,
      type,
    );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Scholarships & Opportunities"
        description="Discover scholarships, internships, competitions and career opportunities matched to your CampusMate profile."
      />

      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              CampusMate Opportunity Intelligence
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Opportunities matched to your career direction.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              CampusMate uses your career target, skills and goals to
              prioritize opportunities and surface deadlines that need
              attention.
            </p>
          </div>

          <Link
            href="/opportunities/track"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Track Applications →
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Opportunities
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data.summary.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Scholarships
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data.summary.scholarships}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Internships
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data.summary.internships}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Saved
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data.summary.saved}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Deadlines ≤ 30 days
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data.summary.upcomingDeadlines}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form
          method="get"
          className="grid gap-4 lg:grid-cols-[1fr_240px_auto]"
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search scholarships, internships, AI, Java, research..."
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />

          <select
            name="type"
            defaultValue={type}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">
              All opportunities
            </option>

            {opportunityTypes.map(
              (item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ),
            )}
          </select>

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Search
          </button>
        </form>
      </section>

      {data.opportunities.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            No opportunities found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try another search term or opportunity category.
          </p>
        </section>
      ) : (
        <section className="grid gap-5 lg:grid-cols-2">
          {data.opportunities.map(
            (item) => {
              const opportunity =
                item.opportunity;

              return (
                <Link
                  key={opportunity.id}
                  href={`/opportunities/${opportunity.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                        {opportunity.opportunityType}
                      </span>

                      {opportunity.isVerified && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Verified
                        </span>
                      )}

                      {opportunity.isFeatured && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Featured
                        </span>
                      )}
                    </div>

                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                      {item.matchScore}% match
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-slate-900 group-hover:underline">
                    {opportunity.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                    {opportunity.description ??
                      "Opportunity details available on the official source."}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Provider
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {opportunity.providerName ??
                          "Not specified"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Deadline
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDeadline(
                          opportunity.deadline,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={`text-sm font-semibold ${
                        item.daysRemaining !== null &&
                        item.daysRemaining <= 7
                          ? "text-red-600"
                          : "text-slate-700"
                      }`}
                    >
                      {getDeadlineLabel(
                        item.daysRemaining,
                      )}
                    </span>

                    {item.application && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                        {item.application.status}
                      </span>
                    )}
                  </div>

                  {item.matchReasons.length > 0 && (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Why CampusMate matched this
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.matchReasons
                          .slice(0, 3)
                          .map(
                            (reason) => (
                              <span
                                key={reason}
                                className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600"
                              >
                                {reason}
                              </span>
                            ),
                          )}
                      </div>
                    </div>
                  )}
                </Link>
              );
            },
          )}
        </section>
      )}
    </div>
  );
}