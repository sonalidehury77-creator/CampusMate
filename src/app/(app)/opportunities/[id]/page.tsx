import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import {
  markOpportunityApplied,
  saveOpportunity,
} from "@/app/(app)/opportunities/actions";
import { getOpportunityById } from "@/services/opportunities/opportunities-data";

type OpportunityDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "long",
      timeStyle: "short",
    },
  ).format(
    new Date(value),
  );
}

export default async function OpportunityDetailPage({
  params,
}: OpportunityDetailPageProps) {
  const { id } =
    await params;

  const data =
    await getOpportunityById(id);

  if (!data) {
    notFound();
  }

  const {
    opportunity,
    application,
    matchScore,
    matchReasons,
    daysRemaining,
  } = data;

  return (
    <div className="space-y-8">
      <PageHeader
        title={opportunity.title}
        description={
          opportunity.providerName ??
          "Scholarship & Opportunity"
        }
      />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/opportunities"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Opportunities
        </Link>

        <Link
          href="/opportunities/track"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Application Tracker
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize">
                {opportunity.opportunityType}
              </span>

              {opportunity.isVerified && (
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Verified source
                </span>
              )}
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              {opportunity.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              {opportunity.description ??
                "Review the official source for complete opportunity details."}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-white p-5 text-center text-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              CampusMate Match
            </p>

            <p className="mt-1 text-4xl font-bold">
              {matchScore}%
            </p>

            <p className="mt-1 text-xs text-slate-500">
              personalized match
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Opportunity Details
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Provider
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {opportunity.providerName ??
                    "Not specified"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Source
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {opportunity.sourceName ??
                    "Not specified"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Location
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {opportunity.location ??
                    "Not specified"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Mode
                </p>

                <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                  {opportunity.mode ??
                    "Not specified"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Deadline
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(
                    opportunity.deadline,
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Time Remaining
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {daysRemaining === null
                    ? "No deadline"
                    : daysRemaining < 0
                      ? "Deadline passed"
                      : daysRemaining === 0
                        ? "Due today"
                        : `${daysRemaining} days remaining`}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Eligibility
            </h2>

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
              {opportunity.eligibility ??
                "Review the official source for complete eligibility requirements."}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Required Documents
            </h2>

            {opportunity.requiredDocuments.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                Check the official source for required documents.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {opportunity.requiredDocuments.map(
                  (document) => (
                    <li
                      key={document}
                      className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700"
                    >
                      <span className="mt-0.5 font-bold text-slate-900">
                        ✓
                      </span>

                      {document}
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>

          {matchReasons.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Why CampusMate Matched You
              </h2>

              <div className="mt-4 space-y-3">
                {matchReasons.map(
                  (reason) => (
                    <div
                      key={reason}
                      className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"
                    >
                      {reason}
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

          {opportunity.tags.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Skills & Tags
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {opportunity.tags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">
              Your Application
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {application
                ? `Current status: ${application.status}`
                : "You have not tracked this opportunity yet."}
            </p>

            <div className="mt-5 space-y-3">
              <form
                action={
                  saveOpportunity
                }
              >
                <input
                  type="hidden"
                  name="opportunity_id"
                  value={opportunity.id}
                />

                <button
                  type="submit"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {application?.status ===
                  "saved"
                    ? "Saved ✓"
                    : "Save Opportunity"}
                </button>
              </form>

              <form
                action={
                  markOpportunityApplied
                }
              >
                <input
                  type="hidden"
                  name="opportunity_id"
                  value={opportunity.id}
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Mark as Applied
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">
              Official Source
            </h2>

            <div className="mt-4 space-y-3">
              {opportunity.applicationUrl && (
                <a
                  href={
                    opportunity.applicationUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Open Application Portal ↗
                </a>
              )}

              {opportunity.sourceUrl && (
                <a
                  href={
                    opportunity.sourceUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Official Source ↗
                </a>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}