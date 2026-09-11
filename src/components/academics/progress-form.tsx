"use client";

import { useActionState } from "react";

import {
  updateSubjectProgress,
  updateUnitProgress,
} from "@/app/(app)/academics/actions";

type SubjectProgressProps = {
  subjectId: string;
  currentProgress: number;
};

export function SubjectProgressForm({
  subjectId,
  currentProgress,
}: SubjectProgressProps) {
  const [state, formAction, pending] =
    useActionState<
      {
        error?: string;
        success?: string;
      } | null,
      FormData
    >(
      async (_previousState, formData) => {
        try {
          await updateSubjectProgress(
            formData,
          );

          return {
            success:
              "Subject progress updated.",
          };
        } catch (error) {
          return {
            error:
              error instanceof Error
                ? error.message
                : "Unable to update progress.",
          };
        }
      },
      null,
    );

  return (
    <form
      action={formAction}
      className="space-y-4"
    >
      <input
        type="hidden"
        name="subjectId"
        value={subjectId}
      />

      <div>
        <label
          htmlFor="subject-progress"
          className="text-sm font-medium"
        >
          Overall subject progress
        </label>

        <div className="mt-2 flex gap-3">
          <input
            id="subject-progress"
            name="progress"
            type="number"
            min="0"
            max="100"
            step="1"
            defaultValue={Math.round(
              currentProgress,
            )}
            className="w-28 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? "Saving..."
              : "Save progress"}
          </button>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      {state?.success && (
        <p className="text-sm text-brand-600">
          {state.success}
        </p>
      )}
    </form>
  );
}

type UnitProgressProps = {
  subjectId: string;
  unitNumber: number;
  currentProgress: number;
  completed: boolean;
};

export function UnitProgressForm({
  subjectId,
  unitNumber,
  currentProgress,
  completed,
}: UnitProgressProps) {
  const [state, formAction, pending] =
    useActionState<
      {
        error?: string;
        success?: string;
      } | null,
      FormData
    >(
      async (_previousState, formData) => {
        try {
          await updateUnitProgress(
            formData,
          );

          return {
            success:
              "Unit progress updated.",
          };
        } catch (error) {
          return {
            error:
              error instanceof Error
                ? error.message
                : "Unable to update progress.",
          };
        }
      },
      null,
    );

  return (
    <form
      action={formAction}
      className="mt-4 rounded-xl border border-border bg-muted/30 p-4"
    >
      <input
        type="hidden"
        name="subjectId"
        value={subjectId}
      />

      <input
        type="hidden"
        name="unitNumber"
        value={unitNumber}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label
            htmlFor={`unit-progress-${unitNumber}`}
            className="text-xs font-medium"
          >
            Unit progress %
          </label>

          <input
            id={`unit-progress-${unitNumber}`}
            name="progress"
            type="number"
            min="0"
            max="100"
            step="1"
            defaultValue={Math.round(
              currentProgress,
            )}
            className="mt-1 w-28 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="completed"
            value="true"
            defaultChecked={completed}
          />

          Mark completed
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Saving..."
            : "Save unit"}
        </button>
      </div>

      {state?.error && (
        <p className="mt-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      {state?.success && (
        <p className="mt-2 text-sm text-brand-600">
          {state.success}
        </p>
      )}
    </form>
  );
}