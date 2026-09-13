"use client";

import { useState, useTransition } from "react";

import {
  deleteNote,
  updateNote,
} from "@/app/(app)/resources/actions";
import type {
  ResourceFilterOptions,
  StudentNote,
} from "@/types/resources";

type NoteCardProps = {
  note: StudentNote;
  filters: ResourceFilterOptions;
};

export function NoteCard({
  note,
  filters,
}: NoteCardProps) {
  const [editing, setEditing] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  const [title, setTitle] =
    useState(note.title);

  const [content, setContent] =
    useState(note.content ?? "");

  const [subjectId, setSubjectId] =
    useState(note.subjectId ?? "");

  const [unitId, setUnitId] =
    useState(note.unitId ?? "");

  const availableUnits =
  filters.units.filter((unit) => {
    if (!subjectId) {
      return true;
    }

    return unit.subjectId === subjectId;
  });

  function handleSave() {
    const formData = new FormData();

    formData.set("title", title);
    formData.set("content", content);
    formData.set("subjectId", subjectId);
    formData.set("unitId", unitId);

    startTransition(async () => {
      const result = await updateNote(
        note.id,
        formData,
      );

      if (result.success) {
        setEditing(false);
        window.location.reload();
      } else {
        window.alert(result.message);
      }
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this note?",
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteNote(
        note.id,
      );

      if (!result.success) {
        window.alert(result.message);
        return;
      }

      window.location.reload();
    });
  }

  if (editing) {
    return (
      <article className="rounded-2xl border border-brand-200 bg-card p-5 shadow-sm">
        <div className="space-y-4">
          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
          />

          <select
            value={subjectId}
            onChange={(event) => {
              setSubjectId(event.target.value);
              setUnitId("");
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">
              No subject
            </option>

            {filters.subjects.map(
              (subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.code} —{" "}
                  {subject.name}
                </option>
              ),
            )}
          </select>

          <select
            value={unitId}
            onChange={(event) =>
              setUnitId(event.target.value)
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">
              No unit
            </option>

            {availableUnits.map((unit) => (
              <option
                key={unit.id}
                value={unit.id}
              >
                Unit {unit.unitNumber} —{" "}
                {unit.title}
              </option>
            ))}
          </select>

          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            rows={7}
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-6 outline-none focus:border-brand-500"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              {isPending
                ? "Saving..."
                : "Save changes"}
            </button>

            <button
              type="button"
              onClick={() =>
                setEditing(false)
              }
              disabled={isPending}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {note.title}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2">
            {note.subject && (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                {note.subject.code}
              </span>
            )}

            {note.unit && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                Unit {note.unit.unitNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
        {note.content ||
          "This note does not contain any text yet."}
      </p>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </article>
  );
}