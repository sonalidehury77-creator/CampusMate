import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { getCareerData } from "@/services/career/career-data";

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
    recommendations,
  } = data;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Career Intelligence"
        title="Career Center"
        description="Build your professional profile, track your skills and projects, and understand what you should improve next."
        actions={
          <Link
            href="/career/profile"
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Edit Career Profile
          </Link>
        }
      />

      {/* Career readiness */}
      <section className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">
              Career Readiness
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              {readiness.score}%
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              This score summarizes your recorded
              skills, practical projects,
              certifications, career goals and
              professional profile.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Score
              label="Skills"
              value={readiness.skillScore}
            />
            <Score
              label="Projects"
              value={readiness.projectScore}
            />
            <Score
              label="Goals"
              value={readiness.goalScore}
            />
            <Score
              label="Profile"
              value={readiness.profileScore}
            />
          </div>
        </div>
      </section>

      {/* Career profile */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-semibold text-brand-600">
          Target
        </p>

        <h2 className="mt-1 text-xl font-bold">
          {profile?.targetRole ??
            "No target role set"}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {profile?.targetIndustry ??
            "Add your target industry to personalize your career roadmap."}
        </p>

        {profile?.careerSummary && (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            {profile.careerSummary}
          </p>
        )}
      </section>

      {/* Skills */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Skills
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your current technical and professional skills.
            </p>
          </div>

          <Link
            href="/career/skills"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Manage skills →
          </Link>
        </div>

        {skills.length === 0 ? (
          <EmptyCard
            text="Add your first skills to start building your career profile."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {skill.name}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {skill.category}
                    </p>
                  </div>

                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {skill.proficiencyLevel}/5
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{
                      width: `${
                        skill.proficiencyLevel *
                        20
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Projects */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Projects
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your practical work and portfolio.
            </p>
          </div>

          <Link
            href="/career/projects"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Manage projects →
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyCard
            text="Add projects to show practical experience."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.slice(0, 4).map(
              (project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">
                      {project.title}
                    </h3>

                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">
                      {project.status.replace(
                        "_",
                        " ",
                      )}
                    </span>
                  </div>

                  {project.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>
                  )}

                  {project.skills.length >
                    0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.skills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700"
                          >
                            {skill}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* Skill gaps */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold">
          Skill Intelligence
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Areas CampusMate recommends improving.
        </p>

        {readiness.gaps.length === 0 ? (
          <p className="mt-5 rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
            Set a target role and target skills to
            generate personalized skill-gap analysis.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {readiness.gaps.map(
              (gap) => (
                <div
                  key={gap.skillId}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold">
                      {gap.skillName}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Current {gap.currentLevel}/5
                      {" · "}
                      Target {gap.targetLevel}/5
                    </p>
                  </div>

                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize">
                    {gap.priority} priority
                  </span>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* Recommendations */}
      <section>
        <h2 className="text-xl font-bold">
          Recommended Next Steps
        </h2>

        <div className="mt-4 space-y-3">
          {readiness.recommendations.map(
            (recommendation) => (
              <div
                key={recommendation}
                className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 text-sm leading-6"
              >
                {recommendation}
              </div>
            ),
          )}

          {recommendations
            .slice(0, 5)
            .map((recommendation) => (
              <div
                key={recommendation.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">
                    {recommendation.title}
                  </h3>

                  <span className="text-xs capitalize text-muted-foreground">
                    {recommendation.priority}
                  </span>
                </div>

                {recommendation.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {recommendation.description}
                  </p>
                )}
              </div>
            ))}
        </div>
      </section>

      {/* Certifications and goals */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold">
            Certifications
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {certifications.length} certification
            {certifications.length === 1
              ? ""
              : "s"} recorded.
          </p>

          <Link
            href="/career/certifications"
            className="mt-4 inline-flex text-sm font-semibold text-brand-700"
          >
            Manage certifications →
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold">
            Career Goals
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {goals.length} goal
            {goals.length === 1
              ? ""
              : "s"} recorded.
          </p>

          <Link
            href="/career/goals"
            className="mt-4 inline-flex text-sm font-semibold text-brand-700"
          >
            Manage career goals →
          </Link>
        </div>
      </section>
    </div>
  );
}

function Score({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-background/70 p-4 text-center">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold">
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
    <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}