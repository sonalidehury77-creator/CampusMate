"use client";

import { useState, useTransition } from "react";

import { updateUnitProgress } from "@/app/(app)/academics/actions";

type Topic = {
  id: string;
  title: string;
  description: string | null;
  sequence_number: number;
};

type Unit = {
  id: string;
  unit_number: number;
  title: string;
  description: string | null;
  progress: number;
  completed: boolean;
  topics: Topic[];
};

type SubjectCardProps = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number | null;
  progress: number;
  units: Unit[];
};

export function SubjectCard({
  id,
  code,
  name,
  description,
  credits,
  progress,
  units,
}: SubjectCardProps) {
  const [expanded, setExpanded] =
    useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                {code}
              </span>

              {credits !== null && (
                <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {credits} credit
                  {credits === 1 ? "" : "s"}
                </span>
              )}
            </div>

            <h2 className="mt-3 text-xl font-semibold text-foreground">
              {name}
            </h2>

            {description && (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <p className="text-2xl font-bold text-foreground">
              {progress}%
            </p>

            <p className="text-xs text-muted-foreground">
              syllabus progress
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-500"
              style={{
                width: `${Math.min(
                  Math.max(progress, 0),
                  100,
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {units.length === 0
              ? "No syllabus units added yet."
              : `${units.length} syllabus unit${
                  units.length === 1 ? "" : "s"
                }`}
          </p>

          {units.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setExpanded((value) => !value)
              }
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              {expanded
                ? "Hide syllabus"
                : "View syllabus"}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-muted/20 p-5 sm:p-6">
          <div className="space-y-4">
            {units.map((unit) => (
              <UnitProgressEditor
                key={unit.id}
                subjectId={id}
                unit={unit}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function UnitProgressEditor({
  subjectId,
  unit,
}: {
  subjectId: string;
  unit: Unit;
}) {
  const [progress, setProgress] =
    useState(unit.progress);

  const [completed, setCompleted] =
    useState(unit.completed);

  const [isPending, startTransition] =
    useTransition();

  const [message, setMessage] =
    useState("");

  function saveProgress(
    nextProgress: number,
    nextCompleted: boolean,
  ) {
    setProgress(nextProgress);
    setCompleted(nextCompleted);
    setMessage("");

    startTransition(async () => {
      const result =
        await updateUnitProgress({
          subjectId,
          unitNumber: unit.unit_number,
          progressPercentage: nextProgress,
          completed: nextCompleted,
        });

      setMessage(result.message);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-600">
              Unit {unit.unit_number}
            </span>

            {completed && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                Completed
              </span>
            )}
          </div>

          <h3 className="mt-1 font-semibold text-foreground">
            {unit.title}
          </h3>

          {unit.description && (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {unit.description}
            </p>
          )}

          {unit.topics.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Topics
              </p>

              <ul className="mt-2 space-y-1">
                {unit.topics.map((topic) => (
                  <li
                    key={topic.id}
                    className="text-sm text-muted-foreground"
                  >
                    {topic.sequence_number}.{" "}
                    {topic.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="w-full shrink-0 lg:w-64">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progress
            </span>

            <span className="font-semibold text-foreground">
              {progress}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            disabled={isPending}
            onChange={(event) =>
              setProgress(
                Number(event.target.value),
              )
            }
            onMouseUp={() =>
              saveProgress(
                progress,
                progress === 100,
              )
            }
            onTouchEnd={() =>
              saveProgress(
                progress,
                progress === 100,
              )
            }
            className="mt-3 w-full accent-[var(--brand-600)]"
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                saveProgress(100, true)
              }
              className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending
                ? "Saving..."
                : completed
                  ? "Completed"
                  : "Mark complete"}
            </button>

            {completed && (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  saveProgress(
                    Math.min(progress, 95),
                    false,
                  )
                }
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
              >
                Undo
              </button>
            )}
          </div>

          {message && (
            <p className="mt-2 text-xs text-muted-foreground">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}