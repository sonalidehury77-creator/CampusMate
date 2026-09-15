"use client";

import { useMemo, useState } from "react";

import { StudySummary } from "@/components/study-planner/study-summary";
import { StudyTaskCard } from "@/components/study-planner/study-task-card";
import { FocusTimer } from "@/components/study-planner/focus-timer";
import { FocusSummary } from "@/components/study-planner/focus-summary";
import { StudyWeekView } from "@/components/study-planner/study-week-view";

import type {
  StudyPlannerData,
} from "@/types/study-planner";

type StudyPlannerPageClientProps = {
  data: StudyPlannerData;
};

type ViewMode =
  | "today"
  | "upcoming"
  | "all";

export function StudyPlannerPageClient({
  data,
}: StudyPlannerPageClientProps) {
  const [viewMode, setViewMode] =
    useState<ViewMode>("today");

  const today =
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

  const visibleTasks = useMemo(() => {
    const tasks = [...data.tasks];

    if (viewMode === "today") {
      return tasks.filter(
        (task) =>
          task.scheduledDate === today,
      );
    }

    if (viewMode === "upcoming") {
      return tasks.filter(
        (task) =>
          Boolean(task.scheduledDate) &&
          task.scheduledDate! >= today &&
          task.status !== "completed",
      );
    }

    return tasks;
  }, [
    data.tasks,
    today,
    viewMode,
  ]);

  return (
    <div className="space-y-8">
      <StudySummary
        totalTasks={
          data.summary.totalTasks
        }
        completedTasks={
          data.summary.completedTasks
        }
        pendingTasks={
          data.summary.pendingTasks
        }
        overdueTasks={
          data.summary.overdueTasks
        }
        todayTasks={
          data.summary.todayTasks
        }
        todayCompleted={
          data.summary.todayCompleted
        }
        weeklyFocusMinutes={
          data.summary.weeklyFocusMinutes
        }
      />

      <StudyWeekView
  tasks={data.tasks}
/>

<FocusSummary
  todayMinutes={0}
  weeklyMinutes={
    data.summary.weeklyFocusMinutes
  }
  sessions={
    data.focusSessions.length
  }
/>

<FocusTimer />

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Your study plan
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Focus on the work that matters most.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["today", "Today"],
                ["upcoming", "Upcoming"],
                ["all", "All tasks"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setViewMode(value)
                }
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  viewMode === value
                    ? "bg-foreground text-background"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {visibleTasks.length > 0 ? (
        <div className="space-y-4">
          {visibleTasks.map((task) => (
            <StudyTaskCard
              key={task.id}
              task={task}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <h2 className="text-lg font-semibold">
            No study tasks here
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your study plan is clear for this view.
          </p>
        </div>
      )}
    </div>
  );
}