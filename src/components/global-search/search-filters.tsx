"use client";

import type { SearchFilter } from "@/types/global-search";

type SearchFiltersProps = {
  value: SearchFilter;
  onChange: (
    value: SearchFilter,
  ) => void;
};

const filters: Array<{
  value: SearchFilter;
  label: string;
}> = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "subject",
    label: "Subjects",
  },
  {
    value: "assignment",
    label: "Assignments",
  },
  {
    value: "notice",
    label: "Notices",
  },
  {
    value: "timetable",
    label: "Timetable",
  },
  {
    value: "resource",
    label: "Resources",
  },
  {
    value: "note",
    label: "Notes",
  },
  {
    value: "study_plan",
    label: "Study Plans",
  },
  {
    value: "study_task",
    label: "Study Tasks",
  },
  {
    value: "exam",
    label: "Exams",
  },
  {
    value: "expense",
    label: "Expenses",
  },
];

export function SearchFilters({
  value,
  onChange,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(
        (filter) => {
          const isActive =
            value ===
            filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() =>
                onChange(
                  filter.value,
                )
              }
              className={
                isActive
                  ? "rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white transition"
                  : "rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-brand-300 hover:text-brand-700"
              }
            >
              {filter.label}
            </button>
          );
        },
      )}
    </div>
  );
}