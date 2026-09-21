import Link from "next/link";

import type { SearchResult } from "@/types/global-search";

import { SearchResultIcon } from "./search-result-icon";

type SearchResultsProps = {
  results: SearchResult[];
};

const labels: Record<
  SearchResult["type"],
  string
> = {
  subject: "Subject",
  assignment: "Assignment",
  notice: "Notice",
  timetable: "Timetable",
  resource: "Resource",
  note: "Note",
  study_plan: "Study Plan",
  study_task: "Study Task",
  exam: "Exam",
  expense: "Expense",
  opportunity: "Opportunity",
};

export function SearchResults({
  results,
}: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background p-8 text-center">
        <p className="text-sm font-medium text-foreground">
          No results found
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search term or select
          another category.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <Link
          key={`${result.type}-${result.id}`}
          href={result.href}
          className="flex items-start gap-4 rounded-2xl border border-border bg-background p-4 transition hover:border-brand-300 hover:bg-brand-50/40"
        >
          <SearchResultIcon
            type={result.type}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-foreground">
                {result.title}
              </h3>

              <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {labels[result.type]}
              </span>
            </div>

            {result.description && (
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {result.description}
              </p>
            )}

            {result.metadata && (
              <p className="mt-2 text-xs text-muted-foreground">
                {result.metadata}
              </p>
            )}
          </div>

          <span
            className="shrink-0 text-sm text-muted-foreground"
            aria-hidden="true"
          >
            →
          </span>
        </Link>
      ))}
    </div>
  );
}