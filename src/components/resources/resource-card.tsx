"use client";

import { useTransition } from "react";

import { deleteResource } from "@/app/(app)/resources/actions";
import type { AcademicResource } from "@/types/resources";

type ResourceCardProps = {
  resource: AcademicResource;
};

const typeLabels: Record<
  AcademicResource["resourceType"],
  string
> = {
  pdf: "PDF",
  image: "Image",
  document: "Document",
  link: "Link",
  note: "Note",
  pyq: "PYQ",
  other: "Resource",
};

export function ResourceCard({
  resource,
}: ResourceCardProps) {
  const [isDeleting, startTransition] =
    useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this resource?",
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      await deleteResource(resource.id);

      window.location.reload();
    });
  }

  const resourceHref =
    resource.externalUrl ??
    resource.signedUrl;

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {typeLabels[resource.resourceType]}
            </span>

            {resource.subject && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {resource.subject.code}
              </span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 text-base font-semibold text-foreground">
            {resource.title}
          </h3>

          {resource.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {resource.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
        {resource.unit && (
          <p>
            Unit {resource.unit.unitNumber}:{" "}
            {resource.unit.title}
          </p>
        )}

        {resource.uploaderName && (
          <p>
            Added by {resource.uploaderName}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {resourceHref && (
          <a
            href={resourceHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            {resource.externalUrl
              ? "Open resource"
              : "Open file"}
          </a>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting
            ? "Deleting..."
            : "Delete"}
        </button>
      </div>
    </article>
  );
}