"use client";

import { useMemo, useState } from "react";

import { NoteCard } from "@/components/resources/note-card";
import { NoteForm } from "@/components/resources/note-form";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceUploadForm } from "@/components/resources/resource-upload-form";

import type { ResourcesData } from "@/types/resources";

type ResourcesPageClientProps = {
  data: ResourcesData;
};

type ActiveTab =
  | "resources"
  | "notes";

export function ResourcesPageClient({
  data,
}: ResourcesPageClientProps) {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>("resources");

  const [search, setSearch] =
    useState("");

  const [subjectFilter, setSubjectFilter] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  const filteredResources =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return data.resources.filter(
        (resource) => {
          const matchesSearch =
            !query ||
            resource.title
              .toLowerCase()
              .includes(query) ||
            resource.description
              ?.toLowerCase()
              .includes(query) ||
            resource.subject?.name
              .toLowerCase()
              .includes(query) ||
            resource.subject?.code
              .toLowerCase()
              .includes(query);

          const matchesSubject =
            !subjectFilter ||
            resource.subjectId ===
              subjectFilter;

          const matchesType =
            !typeFilter ||
            resource.resourceType ===
              typeFilter;

          return (
            matchesSearch &&
            matchesSubject &&
            matchesType
          );
        },
      );
    }, [
      data.resources,
      search,
      subjectFilter,
      typeFilter,
    ]);

  const filteredNotes =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return data.notes.filter(
        (note) => {
          if (!query) {
            return true;
          }

          return (
            note.title
              .toLowerCase()
              .includes(query) ||
            note.content
              ?.toLowerCase()
              .includes(query) ||
            note.subject?.name
              .toLowerCase()
              .includes(query) ||
            note.subject?.code
              .toLowerCase()
              .includes(query)
          );
        },
      );
    }, [data.notes, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">
        <button
          type="button"
          onClick={() =>
            setActiveTab("resources")
          }
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === "resources"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Resources
          <span className="ml-2 opacity-70">
            {data.resources.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("notes")
          }
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === "notes"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          My Notes
          <span className="ml-2 opacity-70">
            {data.notes.length}
          </span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder={
                  activeTab === "resources"
                    ? "Search resources..."
                    : "Search your notes..."
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
              />

              <select
                value={subjectFilter}
                onChange={(event) =>
                  setSubjectFilter(
                    event.target.value,
                  )
                }
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="">
                  All subjects
                </option>

                {data.filters.subjects.map(
                  (subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.code}
                    </option>
                  ),
                )}
              </select>

              {activeTab ===
                "resources" && (
                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value,
                    )
                  }
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">
                    All types
                  </option>
                  <option value="pdf">
                    PDF
                  </option>
                  <option value="image">
                    Image
                  </option>
                  <option value="document">
                    Document
                  </option>
                  <option value="link">
                    Link
                  </option>
                  <option value="note">
                    Note
                  </option>
                  <option value="pyq">
                    PYQ
                  </option>
                  <option value="other">
                    Other
                  </option>
                </select>
              )}
            </div>
          </div>

          {activeTab ===
            "resources" ? (
            filteredResources.length >
            0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredResources.map(
                  (resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                <h3 className="font-semibold">
                  No resources found
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Try another search or add
                  your first resource.
                </p>
              </div>
            )
          ) : filteredNotes.length >
            0 ? (
            <div className="space-y-4">
              {filteredNotes.map(
                (note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    filters={data.filters}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <h3 className="font-semibold">
                No notes found
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Create your first study note.
              </p>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          {activeTab ===
            "resources" ? (
            <ResourceUploadForm
              filters={data.filters}
            />
          ) : (
            <NoteForm
              filters={data.filters}
            />
          )}
        </aside>
      </div>
    </div>
  );
}