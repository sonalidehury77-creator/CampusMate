import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { saveCareerProfile } from "@/services/career/career-mutations";

export default async function CareerProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("career_profiles")
    .select(
      `
        id,
        student_id,
        target_role,
        target_industry,
        target_company_type,
        career_summary,
        github_url,
        linkedin_url,
        portfolio_url,
        resume_url,
        availability_status
      `,
    )
    .eq("student_id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Profile"
        description="Build your professional identity and tell CampusMate where you want your career to go."
      />

      <form
        action={saveCareerProfile}
        className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="target_role"
              className="text-sm font-medium"
            >
              Target role
            </label>

            <input
              id="target_role"
              name="target_role"
              defaultValue={profile?.target_role ?? ""}
              placeholder="e.g. Software Developer"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="target_industry"
              className="text-sm font-medium"
            >
              Target industry
            </label>

            <input
              id="target_industry"
              name="target_industry"
              defaultValue={profile?.target_industry ?? ""}
              placeholder="e.g. Software / AI / FinTech"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="target_company_type"
              className="text-sm font-medium"
            >
              Target company type
            </label>

            <input
              id="target_company_type"
              name="target_company_type"
              defaultValue={profile?.target_company_type ?? ""}
              placeholder="e.g. Product company / Startup / MNC"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="availability_status"
              className="text-sm font-medium"
            >
              Current availability
            </label>

            <select
              id="availability_status"
              name="availability_status"
              defaultValue={
                profile?.availability_status ??
                "open_to_opportunities"
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="open_to_opportunities">
                Open to opportunities
              </option>

              <option value="actively_looking">
                Actively looking
              </option>

              <option value="open_to_internships">
                Open to internships
              </option>

              <option value="not_looking">
                Not looking right now
              </option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="career_summary"
            className="text-sm font-medium"
          >
            Career summary
          </label>

          <textarea
            id="career_summary"
            name="career_summary"
            rows={5}
            defaultValue={profile?.career_summary ?? ""}
            placeholder="Write a short professional summary about yourself, your interests, strengths and career direction."
            className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">
              Professional links
            </h2>

            <p className="text-sm text-muted-foreground">
              Add the profiles recruiters or mentors can use to learn
              more about your work.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="github_url"
                className="text-sm font-medium"
              >
                GitHub URL
              </label>

              <input
                id="github_url"
                name="github_url"
                type="url"
                defaultValue={profile?.github_url ?? ""}
                placeholder="https://github.com/..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="linkedin_url"
                className="text-sm font-medium"
              >
                LinkedIn URL
              </label>

              <input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                defaultValue={profile?.linkedin_url ?? ""}
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="portfolio_url"
                className="text-sm font-medium"
              >
                Portfolio URL
              </label>

              <input
                id="portfolio_url"
                name="portfolio_url"
                type="url"
                defaultValue={profile?.portfolio_url ?? ""}
                placeholder="https://yourportfolio.com"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="resume_url"
                className="text-sm font-medium"
              >
                Resume URL
              </label>

              <input
                id="resume_url"
                name="resume_url"
                type="url"
                defaultValue={profile?.resume_url ?? ""}
                placeholder="https://..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <Link
            href="/career"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Save Career Profile
          </button>
        </div>
      </form>
    </div>
  );
}