"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

import { createResource } from "@/app/(app)/resources/actions";
import type {
  ResourceFilterOptions,
  ResourceType,
  ResourceVisibility,
} from "@/types/resources";

type ResourceUploadFormProps = {
  filters: ResourceFilterOptions;
};

const MAX_FILE_SIZE =
  50 * 1024 * 1024;

const allowedTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

function getResourceType(
  file: File,
): ResourceType {
  if (file.type === "application/pdf") {
    return "pdf";
  }

  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (
    file.type.includes("word") ||
    file.type.includes("document") ||
    file.type.includes("presentation")
  ) {
    return "document";
  }

  return "other";
}

export function ResourceUploadForm({
  filters,
}: ResourceUploadFormProps) {
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [subjectId, setSubjectId] =
    useState("");

  const [unitId, setUnitId] =
    useState("");

  const [visibility, setVisibility] =
    useState<ResourceVisibility>("students");

  const [externalUrl, setExternalUrl] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [isPending, startTransition] =
    useTransition();

  const [error, setError] =
    useState<string | null>(null);

  const availableUnits =
    filters.units.filter((unit) =>
      subjectId
        ? unit.subjectId === subjectId
        : true,
    );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (!file && !externalUrl.trim()) {
      setError(
        "Choose a file or provide an external URL.",
      );
      return;
    }

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError(
          "File size cannot exceed 50 MB.",
        );
        return;
      }

      if (!allowedTypes.has(file.type)) {
        setError(
          "This file type is not supported.",
        );
        return;
      }
    }

    startTransition(async () => {
      try {
        const supabase =
          createClient();

        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError || !userData.user) {
          setError(
            "Your session has expired. Please log in again.",
          );
          return;
        }

        let storagePath:
          | string
          | null = null;

        let resourceType: ResourceType =
          externalUrl.trim()
            ? "link"
            : "other";

        if (file) {
          resourceType =
            getResourceType(file);

          const safeName = file.name
            .replace(
              /[^a-zA-Z0-9._-]/g,
              "-",
            )
            .replace(
              /-+/g,
              "-",
            );

          storagePath =
            `${userData.user.id}/${crypto.randomUUID()}-${safeName}`;

          const { error: uploadError } =
            await supabase.storage
              .from("resources")
              .upload(
                storagePath,
                file,
                {
                  contentType: file.type,
                  cacheControl: "3600",
                  upsert: false,
                },
              );

          if (uploadError) {
            setError(
              uploadError.message,
            );
            return;
          }
        }

        const formData = new FormData();

        formData.set(
          "title",
          title,
        );

        formData.set(
          "description",
          description,
        );

        formData.set(
          "subjectId",
          subjectId,
        );

        formData.set(
          "unitId",
          unitId,
        );

        formData.set(
          "resourceType",
          resourceType,
        );

        formData.set(
          "storagePath",
          storagePath ?? "",
        );

        formData.set(
          "externalUrl",
          externalUrl.trim(),
        );

        formData.set(
          "visibility",
          visibility,
        );

        const result =
          await createResource(
            formData,
          );

        if (!result.success) {
          if (storagePath) {
            await supabase.storage
              .from("resources")
              .remove([
                storagePath,
              ]);
          }

          setError(result.message);
          return;
        }

        setTitle("");
        setDescription("");
        setSubjectId("");
        setUnitId("");
        setExternalUrl("");
        setVisibility("students");
        setFile(null);

        const fileInput =
          document.getElementById(
            "resource-file",
          ) as HTMLInputElement | null;

        if (fileInput) {
          fileInput.value = "";
        }

        window.location.reload();
      } catch {
        setError(
          "Something went wrong while uploading the resource.",
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold">
          Add a resource
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Upload academic files or save useful
          external links.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <input
        value={title}
        onChange={(event) =>
          setTitle(event.target.value)
        }
        placeholder="Resource title"
        required
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
      />

      <textarea
        value={description}
        onChange={(event) =>
          setDescription(
            event.target.value,
          )
        }
        placeholder="Short description"
        rows={3}
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

      <select
        value={visibility}
        onChange={(event) =>
          setVisibility(
            event.target.value as ResourceVisibility,
          )
        }
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
      >
        <option value="private">
          Private
        </option>

        <option value="students">
          Students
        </option>

        <option value="faculty">
          Faculty
        </option>

        <option value="public">
          Public
        </option>
      </select>

      <div>
        <label
          htmlFor="resource-file"
          className="mb-2 block text-sm font-medium"
        >
          Upload file
        </label>

        <input
          id="resource-file"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx"
          onChange={(event) =>
            setFile(
              event.target.files?.[0] ??
                null,
            )
          }
          className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />

        <p className="mt-1 text-xs text-muted-foreground">
          PDF, images, Word or PowerPoint files.
          Maximum 50 MB.
        </p>
      </div>

      <div className="text-center text-xs font-medium text-muted-foreground">
        OR
      </div>

      <input
        value={externalUrl}
        onChange={(event) =>
          setExternalUrl(
            event.target.value,
          )
        }
        placeholder="External HTTPS resource URL"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Uploading..."
          : "Add resource"}
      </button>
    </form>
  );
}