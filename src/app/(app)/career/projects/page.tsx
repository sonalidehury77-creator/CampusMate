import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { getCareerData } from "@/services/career/career-data";
import {
  deleteCareerProject,
  saveCareerProject,
} from "@/services/career/career-mutations";

export default async function CareerProjectsPage() {
  const supabase = await createClient();
  const careerData = await getCareerData();

  const { data: skillCatalog, error: skillError } = await supabase
    .from("career_skills")
    .select("id, name, category")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (skillError) {
    throw new Error(skillError.message);
  }

  async function saveProject(formData: FormData): Promise<void> {
    "use server";

    await saveCareerProject(formData);
  }

  async function removeProject(formData: FormData): Promise<void> {
  "use server";

  await deleteCareerProject(formData);
}

  const projects = careerData.projects;
  const catalog = skillCatalog ?? [];

  const completedProjects = projects.filter(
    (project) => project.status === "completed",
  );

  const activeProjects = projects.filter(
    (project) => project.status === "in_progress",
  );

  const featuredProjects = projects.filter(
    (project) => project.featured,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects & Portfolio"
        description="Show what you can actually build. Projects turn your skills into visible career evidence."
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
          <p className="text-sm text-slate-500">Total Projects</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {projects.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {completedProjects.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {activeProjects.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Featured</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {featuredProjects.length}
          </p>
        </div>
      </section>

      {/* Add project */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Add Project
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add academic, personal, internship or startup projects.
          </p>
        </div>

        <form action={saveProject} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Project Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g. CampusMate"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="project_type"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Project Type
              </label>

              <select
                id="project_type"
                name="project_type"
                defaultValue=""
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select type</option>
                <option value="Academic">Academic</option>
                <option value="Personal">Personal</option>
                <option value="Internship">Internship</option>
                <option value="Startup">Startup</option>
                <option value="Open Source">Open Source</option>
                <option value="Freelance">Freelance</option>
                <option value="Research">Research</option>
              </select>
            </div>
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
              placeholder="What problem does the project solve? What did you build?"
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                defaultValue="in_progress"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="idea">Idea</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="started_at"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Started Date
              </label>

              <input
                id="started_at"
                name="started_at"
                type="date"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="completed_at"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Completed Date
              </label>

              <input
                id="completed_at"
                name="completed_at"
                type="date"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="github_url"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                GitHub URL
              </label>

              <input
                id="github_url"
                name="github_url"
                type="url"
                placeholder="https://github.com/..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="live_url"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Live Project URL
              </label>

              <input
                id="live_url"
                name="live_url"
                type="url"
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                value="true"
                className="h-4 w-4 rounded border-slate-300"
              />

              <label
                htmlFor="featured"
                className="text-sm font-medium text-slate-700"
              >
                Feature this project on my career profile
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="skills"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Skills Used
            </label>

            <select
              id="skills"
              name="skills"
              multiple
              className="min-h-36 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {catalog.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.category} — {skill.name}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-slate-500">
              Hold Ctrl/Cmd to select multiple skills.
            </p>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add Project
          </button>
        </form>
      </section>

      {/* Projects */}
      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Your Projects
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your projects are career evidence that can later power
            CampusMate skill intelligence.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-slate-800">
              No projects yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Add your first project above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {project.title}
                      </h3>

                      {project.featured && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Featured
                        </span>
                      )}
                    </div>

                    {project.projectType && (
                      <p className="mt-1 text-xs text-slate-500">
                        {project.projectType}
                      </p>
                    )}
                  </div>

                  <form action={removeProject}>
                    <input
                      type="hidden"
                      name="id"
                      value={project.id}
                    />

                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>

                <div className="mt-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      project.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : project.status === "in_progress"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {project.status === "in_progress"
                      ? "In Progress"
                      : project.status === "completed"
                        ? "Completed"
                        : "Idea"}
                  </span>
                </div>

                {project.description && (
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {project.description}
                  </p>
                )}

                {project.skills.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Skills
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      GitHub ↗
                    </a>
                  )}

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Live Project ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}