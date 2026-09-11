"use client";

import { useState, useTransition } from "react";

import { updateAssignmentStatus } from "@/app/(app)/assignments/actions";
import type {
  AssignmentStatus,
} from "@/types/assignments";

type AssignmentStatusControlProps = {
  assignmentId: string;
  status: AssignmentStatus;
  notes: string | null;
};

function getStatusLabel(
  status: AssignmentStatus,
) {
  switch (status) {
    case "in_progress":
      return "In progress";

    case "completed":
      return "Completed";

    case "overdue":
      return "Overdue";

    default:
      return "Pending";
  }
}

export function AssignmentStatusControl({
  assignmentId,
  status,
  notes,
}: AssignmentStatusControlProps) {
  const [isPending, startTransition] =
    useTransition();

  const [message, setMessage] =
    useState("");

  const [showNotes, setShowNotes] =
    useState(Boolean(notes));

  const [currentNotes, setCurrentNotes] =
    useState(notes ?? "");

  const effectiveStatus =
    status === "overdue"
      ? "pending"
      : status;

  function handleStatusChange(
    nextStatus: string,
  ) {
    if (
      nextStatus !== "pending" &&
      nextStatus !== "in_progress" &&
      nextStatus !== "completed"
    ) {
      return;
    }

    const formData = new FormData();

    formData.set(
      "assignmentId",
      assignmentId,
    );

    formData.set(
      "status",
      nextStatus,
    );

    formData.set(
      "notes",
      currentNotes,
    );

    setMessage("");

    startTransition(async () => {
      const result =
        await updateAssignmentStatus(
          formData,
        );

      setMessage(result.message);
    });
  }

  function saveNotes() {
    const formData = new FormData();

    formData.set(
      "assignmentId",
      assignmentId,
    );

    formData.set(
      "status",
      effectiveStatus,
    );

    formData.set(
      "notes",
      currentNotes,
    );

    setMessage("");

    startTransition(async () => {
      const result =
        await updateAssignmentStatus(
          formData,
        );

      setMessage(result.message);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label
          htmlFor={`assignment-status-${assignmentId}`}
          className="text-sm font-medium"
        >
          Your status
        </label>

        <select
          id={`assignment-status-${assignmentId}`}
          value={effectiveStatus}
          disabled={isPending}
          onChange={(event) =>
            handleStatusChange(
              event.target.value,
            )
          }
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="pending">
            {getStatusLabel("pending")}
          </option>

          <option value="in_progress">
            {getStatusLabel(
              "in_progress",
            )}
          </option>

          <option value="completed">
            {getStatusLabel(
              "completed",
            )}
          </option>
        </select>

        {status === "overdue" && (
          <span className="text-xs font-medium text-red-600">
            This assignment is overdue.
          </span>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() =>
            setShowNotes((value) => !value)
          }
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          {showNotes
            ? "Hide personal note"
            : "Add personal note"}
        </button>
      </div>

      {showNotes && (
        <div className="space-y-2">
          <textarea
            value={currentNotes}
            onChange={(event) =>
              setCurrentNotes(
                event.target.value,
              )
            }
            rows={3}
            maxLength={2000}
            placeholder="Add your personal reminder or progress note..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {currentNotes.length}/2000
            </p>

            <button
              type="button"
              onClick={saveNotes}
              disabled={isPending}
              className="rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending
                ? "Saving..."
                : "Save note"}
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="text-xs text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  );
}