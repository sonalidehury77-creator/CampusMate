import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { getCareerData } from "@/services/career/career-data";
import {
  deleteCareerGoal,
  saveCareerGoal,
} from "@/services/career/career-mutations";

export default async function CareerGoalsPage() {
  const careerData = await getCareerData();

  async function saveGoal(formData: FormData): Promise<void> {
    "use server";

    await saveCareerGoal(formData);
  }

  async function removeGoal(formData: FormData): Promise<void> {
  "use server";

  await deleteCareerGoal(formData);
}

  const goals = careerData.goals;

  const activeGoals = goals.filter(
    (goal) => goal.status === "active",
  );

  const completedGoals = goals.filter(
    (goal) => goal.status === "completed",
  );

  const averageProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce(
            (total, goal) => total + goal.progress,
            0,
          ) / goals.length,
        )
      : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Career Goals"
        description="Turn your career ambitions into measurable goals that CampusMate can help you track."
        actions={
          <Link
            href="/career"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Career Center
          </Link>
        }
      />

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Goals</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {goals.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Goals</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {activeGoals.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {completedGoals.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Average Progress
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {averageProgress}%
          </p>
        </div>
      </section>

      {/* Add goal */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Create Career Goal
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Define what you want to achieve and give yourself a target
            date.
          </p>
        </div>

        <form action={saveGoal} className="space-y-5">
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Goal Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Get a software engineering internship"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe what success looks like for this goal."
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="goal_type"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Goal Type
              </label>

              <select
                id="goal_type"
                name="goal_type"
                defaultValue="job"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="job">Job</option>
                <option value="internship">Internship</option>
                <option value="placement">Placement</option>
                <option value="higher_studies">
                  Higher Studies
                </option>
                <option value="freelancing">Freelancing</option>
                <option value="entrepreneurship">
                  Entrepreneurship
                </option>
                <option value="certification">
                  Certification
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="target_date"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Target Date
              </label>

              <input
                id="target_date"
                name="target_date"
                type="date"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="progress"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Current Progress (%)
            </label>

            <input
              id="progress"
              name="progress"
              type="number"
              min="0"
              max="100"
              defaultValue="0"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create Career Goal
          </button>
        </form>
      </section>

      {/* Goals */}
      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Your Career Roadmap
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track your progress toward your long-term career objectives.
          </p>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-slate-800">
              No career goals yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Create your first goal above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <article
                key={goal.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {goal.title}
                      </h3>

                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
                        {goal.goalType.replaceAll("_", " ")}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          goal.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : goal.status === "active"
                              ? "bg-amber-50 text-amber-700"
                              : goal.status === "paused"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-red-50 text-red-700"
                        }`}
                      >
                        {goal.status}
                      </span>
                    </div>

                    {goal.description && (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  <form action={removeGoal}>
                    <input
                      type="hidden"
                      name="id"
                      value={goal.id}
                    />

                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      Progress
                    </span>

                    <span className="text-sm font-bold text-slate-900">
                      {goal.progress}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900 transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, goal.progress),
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-500">
                  {goal.targetDate && (
                    <p>
                      <span className="font-medium text-slate-800">
                        Target:
                      </span>{" "}
                      {goal.targetDate}
                    </p>
                  )}

                  <p>
                    <span className="font-medium text-slate-800">
                      Status:
                    </span>{" "}
                    {goal.status}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Smart roadmap */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Smart Career Roadmap
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          Goals + Skills + Projects = Career Intelligence
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          CampusMate can connect your career goals with your current
          skills, projects and certifications to identify the next
          actions needed to move toward your target.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/career/skills"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Review Skills →
          </Link>

          <Link
            href="/career/projects"
            className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Build Projects →
          </Link>
        </div>
      </section>
    </div>
  );
}