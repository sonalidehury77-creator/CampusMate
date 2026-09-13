"use client";

import { useState, useTransition } from "react";

import { createNote } from "@/app/(app)/resources/actions";
import type { ResourceFilterOptions } from "@/types/resources";

type NoteFormProps = {
  filters: ResourceFilterOptions;
};

export function NoteForm({
  filters,
}: NoteFormProps) {
  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [subjectId, setSubjectId] =
    useState("");

  const [unitId, setUnitId] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  const availableUnits =
    filters.units.filter((unit) =>
      subjectId
        ? unit.subjectId === subjectId
        : true,
    );

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData();

    formData.set("title", title);
    formData.set("content", content);
    formData.set("subjectId", subjectId);
    formData.set("unitId", unitId);

    startTransition(async () => {
      const result =
        await createNote(formData);

      if (!result.success) {
        window.alert(result.message);
        return;
      }

      setTitle("");
      setContent("");
      setSubjectId("");
      setUnitId("");

      window.location.reload();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold">
          Create a study note
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Save your own exam-ready notes and
          revision points.
        </p>
      </div>

      <input
        value={title}
        onChange={(event) =>
          setTitle(event.target.value)
        }
        placeholder="Note title"
        required
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
          Select subject
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
          Select unit
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
        placeholder="Write your notes..."
        rows={8}
        className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-7 outline-none focus:border-brand-500"
      />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : "Save note"}
      </button>
    </form>
  );
}