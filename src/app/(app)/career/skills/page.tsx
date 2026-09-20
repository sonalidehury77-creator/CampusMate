import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { getCareerData } from "@/services/career/career-data";
import {
  deleteStudentSkill,
  saveStudentSkill,
} from "@/services/career/career-mutations";

export default async function CareerSkillsPage() {
  const supabase = await createClient();
  const careerData = await getCareerData();

  const { data: skillCatalog, error: skillError } = await supabase
    .from("career_skills")
    .select("id, name, category, description, is_technical")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (skillError) {
    throw new Error(skillError.message);
  }

  async function saveSkill(formData: FormData): Promise<void> {
    "use server";

    await saveStudentSkill(formData);
  }

  async function removeSkill(formData: FormData): Promise<void> {
  "use server";

  await deleteStudentSkill(formData);
}

  const skills = careerData.skills;
  const catalog = skillCatalog ?? [];

  const technicalSkills = skills.filter(
    (skill) =>
      catalog.find((item) => item.id === skill.skillId)?.is_technical,
  );

  const softSkills = skills.filter(
    (skill) =>
      !catalog.find((item) => item.id === skill.skillId)?.is_technical,
  );

  const averageProficiency =
    skills.length > 0
      ? Math.round(
          skills.reduce(
            (total, skill) => total + skill.proficiencyLevel,
            0,
          ) / skills.length,
        )
      : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Skills & Skill Intelligence"
        description="Build your professional skill profile, track proficiency, and identify where you need to grow."
        actions={
          <Link
            href="/career"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Career Center
          </Link>
        }
      />

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Skills
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {skills.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Skills currently in your profile
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Technical Skills
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {technicalSkills.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Programming, tools and technologies
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Other Skills
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {softSkills.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Communication, leadership and other abilities
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Average Proficiency
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {averageProficiency}/5
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Based on your current skill levels
          </p>
        </div>
      </section>

      {/* Add skill */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Add a Skill
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add a skill and tell CampusMate how confident you are with it.
          </p>
        </div>

        <form action={saveSkill} className="grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="skill_id"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Skill
            </label>

            <select
              id="skill_id"
              name="skill_id"
              required
              defaultValue=""
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="" disabled>
                Select a skill
              </option>

              {catalog.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.category} — {skill.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="proficiency_level"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Proficiency Level
            </label>

            <select
              id="proficiency_level"
              name="proficiency_level"
              defaultValue="3"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="1">1 — Beginner</option>
              <option value="2">2 — Basic</option>
              <option value="3">3 — Intermediate</option>
              <option value="4">4 — Advanced</option>
              <option value="5">5 — Expert</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="years_experience"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Years of Experience
            </label>

            <input
              id="years_experience"
              name="years_experience"
              type="number"
              min="0"
              max="50"
              step="0.5"
              placeholder="e.g. 1.5"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="evidence"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Evidence
            </label>

            <input
              id="evidence"
              name="evidence"
              type="text"
              placeholder="e.g. CampusMate, Java Lab, internship..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Add Skill
            </button>
          </div>
        </form>
      </section>

      {/* Current skills */}
      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Your Skills
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep your skill profile updated as you learn and build projects.
          </p>
        </div>

        {skills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-slate-800">
              No skills added yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Add your first technical or professional skill above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {skills.map((skill) => {
              const catalogSkill = catalog.find(
                (item) => item.id === skill.skillId,
              );

              return (
                <article
                  key={skill.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {skill.name}
                        </h3>

                        {catalogSkill?.is_technical ? (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            Technical
                          </span>
                        ) : (
                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                            Professional
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {skill.category}
                      </p>
                    </div>

                    <form action={removeSkill}>
                      <input
                        type="hidden"
                        name="id"
                        value={skill.id}
                      />

                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </form>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Proficiency
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {skill.proficiencyLevel}/5
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900"
                        style={{
                          width: `${(skill.proficiencyLevel / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {skill.yearsExperience !== null && (
                    <p className="mt-4 text-sm text-slate-600">
                      <span className="font-medium">
                        Experience:
                      </span>{" "}
                      {skill.yearsExperience}{" "}
                      {skill.yearsExperience === 1
                        ? "year"
                        : "years"}
                    </p>
                  )}

                  {skill.evidence && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Evidence
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {skill.evidence}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Intelligence */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          CampusMate Skill Intelligence
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          Your skill profile becomes career intelligence.
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          CampusMate can use your skills, projects, certifications and
          career goals together to identify skill gaps and recommend what
          you should learn next.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/career/projects"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Add Projects →
          </Link>

          <Link
            href="/career/goals"
            className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Set Career Goals →
          </Link>
        </div>
      </section>
    </div>
  );
}