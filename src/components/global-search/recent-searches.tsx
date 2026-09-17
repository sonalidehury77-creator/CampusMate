"use client";

type RecentSearchesProps = {
  searches: string[];
  onSelect: (
    query: string,
  ) => void;
  onClear: () => void;
};

export function RecentSearches({
  searches,
  onSelect,
  onClear,
}: RecentSearchesProps) {
  if (searches.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-foreground">
          Recent searches
        </h2>

        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {searches.map((search) => (
          <button
            key={search}
            type="button"
            onClick={() =>
              onSelect(search)
            }
            className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition hover:border-brand-300 hover:text-brand-700"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
}