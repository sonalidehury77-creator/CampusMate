import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { getCareerIntelligence } from "@/services/career/career-intelligence";

function getScoreLabel(
  score: number,
) {
  if (score >= 80) {
    return "Strong";
  }

  if (score >= 60) {
    return "Developing";
  }

  if (score >= 40) {
    return "Needs improvement";
  }

  return "Getting started";
}

function getLevelLabel(
  level: number,
) {
  switch (level) {
    case 0:
      return "Not added";

    case 1:
      return "Beginner";

    case 2:
      return "Basic";

    case 3:
      return "Intermediate";

    case 4:
      return "Advanced";

    case 5:
      return "Strong";

    default:
      return "Not added";
  }
}

function ScoreCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold text-slate-900">
          {value}%
        </p>

        <p className="text-xs font-medium text-slate-500">
          {getScoreLabel(value)}
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{
            width: `${Math.min(
              100,
              Math.max(0, value),
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

export default async function CareerIntelligencePage() {
  const intelligence =
    await getCareerIntelligence();

  const {
    data,
    roleProfile,
    readiness,
    skillGaps,
    strengths,
    recommendedActions,
    roleMatchScore,
  } = intelligence;

  const profile =
    data.profile;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Career Intelligence"
        description="Analyze your career readiness, target-role alignment, skill gaps and recommended actions."
      />

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              CampusMate
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {profile?.targetRole
                ? `${profile.targetRole} Career Path`
                : "Build your Career Intelligence"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              CampusMate uses your stored career profile, skills,
              projects, certifications and goals to calculate useful
              career signals.
            </p>
          </div>

          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full border-[12px] border-slate-700">
            <div className="text-center">
              <p className="text-5xl font-bold">
                {readiness.score}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                readiness
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <ScoreCard
          label="Overall"
          value={readiness.score}
        />

        <ScoreCard
          label="Skills"
          value={readiness.skillScore}
        />

        <ScoreCard
          label="Projects"
          value={readiness.projectScore}
        />

        <ScoreCard
          label="Certifications"
          value={
            readiness.certificationScore
          }
        />

        <ScoreCard
          label="Goals"
          value={readiness.goalScore}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Target Role
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {profile?.targetRole ??
              "No target role set"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {roleProfile?.description ??
              "Set a supported target role in your Career Profile to unlock role-specific skill analysis."}
          </p>

          {roleProfile && (
            <div className="mt-5 flex flex-wrap gap-2">
              {roleProfile.skills.map(
                (skill) => (
                  <span
                    key={skill.name}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {skill.name}
                  </span>
                ),
              )}
            </div>
          )}

          <Link
            href="/career/profile"
            className="mt-6 inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit Career Profile
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Role Match
          </p>

          <p className="mt-2 text-5xl font-bold text-slate-900">
            {roleMatchScore}%
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Current recorded skills compared with the expected skills
            for the selected role.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Skill Intelligence
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Skill Gap Analysis
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Skills where your current proficiency is below the target level.
          </p>
        </div>

        {!roleProfile ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="font-semibold text-slate-800">
              Target role required
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Set a supported target role in your Career Profile first.
            </p>

            <Link
              href="/career/profile"
              className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Set Target Role →
            </Link>
          </div>
        ) : skillGaps.length ===
          0 ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="font-semibold text-emerald-900">
              No current skill gaps detected.
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-700">
              Your recorded skills currently meet the target levels for
              this role.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {skillGaps.map(
              (gap) => {
                const percentage =
                  gap.targetLevel >
                  0
                    ? Math.min(
                        100,
                        Math.round(
                          (gap.currentLevel /
                            gap.targetLevel) *
                            100,
                        ),
                      )
                    : 0;

                return (
                  <article
                    key={gap.skillId}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {gap.skillName}
                          </h3>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                            {gap.category}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              gap.priority ===
                              "high"
                                ? "bg-red-50 text-red-700"
                                : gap.priority ===
                                  "medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {gap.priority}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Current:{" "}
                          {getLevelLabel(
                            gap.currentLevel,
                          )}{" "}
                          → Target:{" "}
                          {getLevelLabel(
                            gap.targetLevel,
                          )}
                        </p>
                      </div>

                      <p className="text-sm font-bold text-slate-700">
                        {gap.currentLevel}/
                        {gap.targetLevel}
                      </p>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {gap.gap} level
                      {gap.gap === 1
                        ? ""
                        : "s"}{" "}
                      remaining.
                    </p>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Strengths
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Your current strengths
          </h2>

          {strengths.length ===
          0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-5">
              <p className="text-sm text-slate-500">
                Add more skills, projects and goals to identify your
                strongest career signals.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {strengths.map(
                (
                  strength,
                  index,
                ) => (
                  <div
                    key={`${strength}-${index}`}
                    className="flex gap-3 rounded-xl bg-emerald-50 p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                      ✓
                    </span>

                    <p className="text-sm leading-6 text-emerald-900">
                      {strength}
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Career Evidence
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Your current inventory
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Skills
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {data.skills.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Projects
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {data.projects.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Certifications
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {data.certifications.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Career Goals
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {data.goals.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Action Plan
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          Recommended Next Actions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Actions based on the information currently stored in your Career Center.
        </p>

        {recommendedActions.length ===
        0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6">
            <p className="text-sm text-slate-500">
              No additional actions are currently required.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {recommendedActions.map(
              (
                action,
                index,
              ) => (
                <div
                  key={`${action}-${index}`}
                  className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {index + 1}
                  </span>

                  <p className="text-sm leading-6 text-slate-700">
                    {action}
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/career"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Career Center
        </Link>

        <Link
          href="/career/skills"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Manage Skills
        </Link>

        <Link
          href="/career/projects"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Manage Projects
        </Link>

        <Link
          href="/career/goals"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Manage Goals
        </Link>
      </section>
    </div>
  );
}