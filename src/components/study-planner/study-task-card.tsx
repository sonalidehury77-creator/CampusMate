"use client";

import type { StudyTask } from "@/types/study-planner";

type StudyTaskCardProps = {
  task: StudyTask;
  onComplete?: (taskId: string) => void;
};

export function StudyTaskCard({
  task,
  onComplete,
}: StudyTaskCardProps) {
  const isCompleted =
    task.status === "completed";

  const priorityClass =
    task.priority === "urgent"
      ? "border-red-200 bg-red-50 text-red-700"
      : task.priority === "high"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : task.priority === "medium"
          ? "border-brand-200 bg-brand-50 text-brand-700"
          : "border-border bg-muted text-muted-foreground";

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <button
          type="button"
          aria-label={
            isCompleted
              ? "Task completed"
              : "Mark task as completed"
          }
          disabled={isCompleted}
          onClick={() => onComplete?.(task.id)}
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
            isCompleted
              ? "border-brand-500 bg-brand-500 text-white"
              : "border-border hover:border-brand-500"
          }`}
        >
          {isCompleted ? "✓" : ""}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`font-semibold ${
                isCompleted
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {task.title}
            </h3>

            <span
              className={`rounded-full border px-2 py-1 text-xs font-medium capitalize ${priorityClass}`}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {task.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {task.subject && (
              <span className="rounded-full bg-muted px-2.5 py-1">
                {task.subject.code}
              </span>
            )}

            {task.unit && (
              <span className="rounded-full bg-muted px-2.5 py-1">
                Unit {task.unit.unitNumber}
              </span>
            )}

            <span className="rounded-full bg-muted px-2.5 py-1">
              {task.durationMinutes} min
            </span>

            {task.scheduledDate && (
              <span className="rounded-full bg-muted px-2.5 py-1">
                {task.scheduledDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}