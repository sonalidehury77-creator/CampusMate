import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { getCareerData } from "@/services/career/career-data";
import {
  deleteCareerCertification,
  saveCareerCertification,
} from "@/services/career/career-mutations";

export default async function CareerCertificationsPage() {
  const careerData = await getCareerData();

  async function saveCertification(formData: FormData): Promise<void> {
    "use server";

    await saveCareerCertification(formData);
  }

  async function removeCertification(formData: FormData): Promise<void> {
  "use server";

  await deleteCareerCertification(formData);
}

  const certifications = careerData.certifications;

  const activeCertifications = certifications.filter(
    (certification) =>
      certification.doesNotExpire ||
      !certification.expiryDate ||
      new Date(certification.expiryDate) >= new Date(),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Certifications"
        description="Keep your professional certifications, credentials and achievements organized in one place."
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
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Certifications
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {certifications.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active / Valid
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {activeCertifications.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Non-Expiring
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {
              certifications.filter(
                (certification) => certification.doesNotExpire,
              ).length
            }
          </p>
        </div>
      </section>

      {/* Add certification */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Add Certification
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add certificates from courses, platforms, universities or
            professional organizations.
          </p>
        </div>

        <form action={saveCertification} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Certification Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. AWS Cloud Practitioner"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="issuing_organization"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Issuing Organization
              </label>

              <input
                id="issuing_organization"
                name="issuing_organization"
                type="text"
                placeholder="e.g. AWS, Coursera, Google"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="credential_id"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Credential ID
              </label>

              <input
                id="credential_id"
                name="credential_id"
                type="text"
                placeholder="Optional credential ID"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="credential_url"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Credential URL
              </label>

              <input
                id="credential_url"
                name="credential_url"
                type="url"
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="issue_date"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Issue Date
              </label>

              <input
                id="issue_date"
                name="issue_date"
                type="date"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="expiry_date"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Expiry Date
              </label>

              <input
                id="expiry_date"
                name="expiry_date"
                type="date"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              id="does_not_expire"
              name="does_not_expire"
              type="checkbox"
              value="true"
              className="h-4 w-4 rounded border-slate-300"
            />

            <label
              htmlFor="does_not_expire"
              className="text-sm font-medium text-slate-700"
            >
              This certification does not expire
            </label>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add Certification
          </button>
        </form>
      </section>

      {/* Certification list */}
      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Your Certifications
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Verified credentials strengthen your career profile.
          </p>
        </div>

        {certifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-slate-800">
              No certifications yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Add your certificates above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {certifications.map((certification) => {
              const isExpired =
                !certification.doesNotExpire &&
                certification.expiryDate &&
                new Date(certification.expiryDate) < new Date();

              return (
                <article
                  key={certification.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {certification.name}
                      </h3>

                      {certification.issuingOrganization && (
                        <p className="mt-1 text-sm text-slate-500">
                          {certification.issuingOrganization}
                        </p>
                      )}
                    </div>

                    <form action={removeCertification}>
                      <input
                        type="hidden"
                        name="id"
                        value={certification.id}
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
                    {certification.doesNotExpire ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Does not expire
                      </span>
                    ) : isExpired ? (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        Expired
                      </span>
                    ) : (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Valid
                      </span>
                    )}
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-slate-600">
                    {certification.credentialId && (
                      <p>
                        <span className="font-medium text-slate-800">
                          Credential ID:
                        </span>{" "}
                        {certification.credentialId}
                      </p>
                    )}

                    {certification.issueDate && (
                      <p>
                        <span className="font-medium text-slate-800">
                          Issued:
                        </span>{" "}
                        {certification.issueDate}
                      </p>
                    )}

                    {certification.expiryDate &&
                      !certification.doesNotExpire && (
                        <p>
                          <span className="font-medium text-slate-800">
                            Expires:
                          </span>{" "}
                          {certification.expiryDate}
                        </p>
                      )}
                  </div>

                  {certification.credentialUrl && (
                    <div className="mt-5">
                      <a
                        href={certification.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Verify Credential ↗
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Intelligence */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Career Intelligence
        </p>

        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          Certifications are part of your readiness profile.
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          CampusMate can combine certifications with your skills,
          projects and goals when calculating career readiness and
          identifying development opportunities.
        </p>
      </section>
    </div>
  );
}