"use client";

import { useMemo, useState } from "react";

import { AssignmentList } from "@/components/assignments/assignment-list";
import type {
  Assignment,
} from "@/types/assignments";

type AssignmentFiltersProps = {
  assignments: Assignment[];
};

type FilterStatus =
  | "all"
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue";

export function AssignmentFilters({
  assignments,
}: AssignmentFiltersProps) {
  const [status, setStatus] =
    useState<FilterStatus>("all");

  const [subject, setSubject] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const subjects = useMemo(() => {
    const map = new Map<
      string,
      string
    >();

    assignments.forEach((assignment) => {
      map.set(
        assignment.subjectId,
        `${assignment.subjectCode} — ${assignment.subjectName}`,
      );
    });

    return Array.from(map.entries());
  }, [assignments]);

  const filteredAssignments =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return assignments.filter(
        (assignment) => {
          const matchesStatus =
            status === "all" ||
            assignment.status === status;

          const matchesSubject =
            subject === "all" ||
            assignment.subjectId ===
              subject;

          const matchesSearch =
            normalizedSearch.length ===
              0 ||
            assignment.title
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            assignment.subjectName
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            assignment.subjectCode
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          return (
            matchesStatus &&
            matchesSubject &&
            matchesSearch
          );
        },
      );
    }, [
      assignments,
      search,
      status,
      subject,
    ]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 lg:grid-cols-[1fr_auto_auto]">
        <div>
          <label
            htmlFor="assignment-search"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Search
          </label>

          <input
            id="assignment-search"
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search assignments..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="assignment-status-filter"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Status
          </label>

          <select
            id="assignment-status-filter"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as FilterStatus,
              )
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">
              All statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="in_progress">
              In progress
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="overdue">
              Overdue
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="assignment-subject-filter"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Subject
          </label>

          <select
            id="assignment-subject-filter"
            value={subject}
            onChange={(event) =>
              setSubject(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">
              All subjects
            </option>

            {subjects.map(
              ([
                subjectId,
                subjectLabel,
              ]) => (
                <option
                  key={subjectId}
                  value={subjectId}
                >
                  {subjectLabel}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredAssignments.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {assignments.length}
          </span>{" "}
          assignments
        </p>

        {(status !== "all" ||
          subject !== "all" ||
          search.length > 0) && (
          <button
            type="button"
            onClick={() => {
              setStatus("all");
              setSubject("all");
              setSearch("");
            }}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <AssignmentList
        assignments={
          filteredAssignments
        }
      />
    </div>
  );
}