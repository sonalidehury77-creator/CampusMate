import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { getCareerData } from "@/services/career/career-data";

function ScoreCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white/80 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}%
      </p>
    </div>
  );
}

function EmptyCard({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}

export default async function CareerPage() {
  const data =
    await getCareerData();

  const {
    profile,
    skills,
    projects,
    certifications,
    goals,
    readiness,
  } = data;

  const completedProjects =
    projects.filter(
      (project) =>
        project.status ===
        "completed",
    ).length;

  const activeGoals =
    goals.filter(
      (goal) =>
        goal.status === "active",
    ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Career Center"
        description="Build your professional profile, track your skills and projects, and manage your career goals."
      />

      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Career Intelligence
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Turn your career data into a clear action plan.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Review your career readiness, target-role alignment,
              skill gaps and recommended next actions.
            </p>
          </div>

          <Link
            href="/career/intelligence"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Open Career Intelligence →
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600">
              Career Readiness
            </p>

            <h2 className="mt-1 text-4xl font-bold text-slate-900">
              {readiness.score}%
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Based on your profile, skills, projects, certifications
              and career goals.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ScoreCard
              label="Skills"
              value={readiness.skillScore}
            />

            <ScoreCard
              label="Projects"
              value={readiness.projectScore}
            />

            <ScoreCard
              label="Goals"
              value={readiness.goalScore}
            />

            <ScoreCard
              label="Profile"
              value={readiness.profileScore}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Target Career
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {profile?.targetRole ??
                "No target role set"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {profile?.targetIndustry ??
                "Add your target industry to personalize your career profile."}
            </p>

            {profile?.careerSummary && (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                {profile.careerSummary}
              </p>
            )}
          </div>

          <Link
            href="/career/profile"
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit Profile
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Career Development
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage the information CampusMate uses for career intelligence.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/career/profile"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold text-slate-400">
              01
            </p>

            <h3 className="mt-3 text-lg font-bold text-slate-900">
              Career Profile
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Set your target role, industry and professional links.
            </p>

            <p className="mt-5 text-sm font-semibold text-slate-900">
              Manage profile →
            </p>
          </Link>

          <Link
            href="/career/skills"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold text-slate-400">
              02
            </p>

            <h3 className="mt-3 text-lg font-bold text-slate-900">
              Skills
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Track technical and professional skills with proficiency levels.
            </p>

            <p className="mt-5 text-sm font-semibold text-slate-900">
              Manage skills →
            </p>
          </Link>

          <Link
            href="/career/projects"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold text-slate-400">
              03
            </p>

            <h3 className="mt-3 text-lg font-bold text-slate-900">
              Projects
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Showcase practical projects, GitHub links and live work.
            </p>

            <p className="mt-5 text-sm font-semibold text-slate-900">
              Manage projects →
            </p>
          </Link>

          <Link
            href="/career/certifications"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold text-slate-400">
              04
            </p>

            <h3 className="mt-3 text-lg font-bold text-slate-900">
              Certifications
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Keep your certifications and verified achievements organized.
            </p>

            <p className="mt-5 text-sm font-semibold text-slate-900">
              Manage certifications →
            </p>
          </Link>

          <Link
            href="/career/goals"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold text-slate-400">
              05
            </p>

            <h3 className="mt-3 text-lg font-bold text-slate-900">
              Career Goals
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create measurable goals for jobs, placements, internships and learning.
            </p>

            <p className="mt-5 text-sm font-semibold text-slate-900">
              Manage goals →
            </p>
          </Link>

          <Link
            href="/career/intelligence"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
          >
            <p className="text-xs font-semibold text-slate-400">
              06
            </p>

            <h3 className="mt-3 text-lg font-bold text-white">
              Career Intelligence
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Analyze readiness, role match, skill gaps and next actions.
            </p>

            <p className="mt-5 text-sm font-semibold text-white">
              Open intelligence →
            </p>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Skills
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {skills.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Completed Projects
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {completedProjects}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Certifications
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {certifications.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Goals
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {activeGoals}
          </p>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Your Skills
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current skills recorded in your career profile.
            </p>
          </div>

          <Link
            href="/career/skills"
            className="text-sm font-semibold text-slate-700 hover:underline"
          >
            Manage skills →
          </Link>
        </div>

        {skills.length === 0 ? (
          <EmptyCard text="Add your first skills to start building Career Intelligence." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.slice(0, 6).map(
              (skill) => (
                <div
                  key={skill.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {skill.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {skill.category}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {skill.proficiencyLevel}/5
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Projects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Practical work that supports your career profile.
            </p>
          </div>

          <Link
            href="/career/projects"
            className="text-sm font-semibold text-slate-700 hover:underline"
          >
            Manage projects →
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyCard text="Add a project to show practical evidence of your skills." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.slice(0, 4).map(
              (project) => (
                <article
                  key={project.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-slate-900">
                      {project.title}
                    </h3>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                      {project.status.replaceAll(
                        "_",
                        " ",
                      )}
                    </span>
                  </div>

                  {project.description && (
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {project.description}
                    </p>
                  )}

                  {project.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.skills
                        .slice(0, 5)
                        .map(
                          (skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                            >
                              {skill}
                            </span>
                          ),
                        )}
                    </div>
                  )}
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Next Step
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Review your Career Intelligence
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              See which skills need improvement for your target role and
              what actions can strengthen your career profile.
            </p>
          </div>

          <Link
            href="/career/intelligence"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Analyze Career →
          </Link>
        </div>
      </section>

      {readiness.recommendations.length >
        0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Recommended Actions
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {readiness.recommendations
              .slice(0, 4)
              .map(
                (
                  recommendation,
                  index,
                ) => (
                  <div
                    key={`${recommendation}-${index}`}
                    className="flex gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>

                    <p className="text-sm leading-6 text-slate-700">
                      {recommendation}
                    </p>
                  </div>
                ),
              )}
          </div>
        </section>
      )}
    </div>
  );
}