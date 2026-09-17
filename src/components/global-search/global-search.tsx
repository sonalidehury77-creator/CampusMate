"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import type {
  GlobalSearchResponse,
  SearchFilter,
} from "@/types/global-search";

import { SearchFilters } from "./search-filters";
import { SearchResults } from "./search-results";

type GlobalSearchProps = {
  initialData: GlobalSearchResponse;
  initialFilter?: SearchFilter;
};

const RECENT_SEARCHES_KEY =
  "campusmate_recent_searches";

const RECENT_SEARCHES_EVENT =
  "campusmate-recent-searches";

const MAX_RECENT_SEARCHES = 6;

/*
 * ---------------------------------------------------------
 * RECENT SEARCHES
 * ---------------------------------------------------------
 */

/**
 * Read the raw localStorage value.
 *
 * IMPORTANT:
 * useSyncExternalStore requires getSnapshot()
 * to return a cached/stable value.
 *
 * Therefore we return the localStorage STRING here,
 * not a newly-created array.
 */
function getRecentSearchesSnapshot(): string {
  if (typeof window === "undefined") {
    return "[]";
  }

  try {
    return (
      window.localStorage.getItem(
        RECENT_SEARCHES_KEY,
      ) ?? "[]"
    );
  } catch {
    return "[]";
  }
}

/**
 * Server snapshot must be exactly the same type
 * as the client snapshot.
 */
function getServerRecentSearchesSnapshot(): string {
  return "[]";
}

/**
 * Convert the stable snapshot string into an array.
 */
function parseRecentSearches(
  snapshot: string,
): string[] {
  try {
    const parsed: unknown =
      JSON.parse(snapshot);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0,
    );
  } catch {
    return [];
  }
}

/**
 * Save recent searches to localStorage.
 */
function saveRecentSearches(
  searches: string[],
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const value = JSON.stringify(searches);

    window.localStorage.setItem(
      RECENT_SEARCHES_KEY,
      value,
    );

    /*
     * The browser does not fire the normal
     * "storage" event in the same tab that
     * changed localStorage.
     *
     * Therefore we dispatch our own event.
     */
    window.dispatchEvent(
      new Event(
        RECENT_SEARCHES_EVENT,
      ),
    );
  } catch {
    /*
     * Ignore localStorage errors.
     *
     * The search functionality itself
     * should continue working even if
     * localStorage is unavailable.
     */
  }
}

/**
 * Add a search to the recent-search list.
 */
function addToRecentSearches(
  value: string,
): string[] {
  const trimmedValue =
    value.trim();

  if (!trimmedValue) {
    return [];
  }

  const currentSnapshot =
    getRecentSearchesSnapshot();

  const current =
    parseRecentSearches(
      currentSnapshot,
    );

  const updated = [
    trimmedValue,
    ...current.filter(
      (item) =>
        item.toLowerCase() !==
        trimmedValue.toLowerCase(),
    ),
  ].slice(
    0,
    MAX_RECENT_SEARCHES,
  );

  saveRecentSearches(updated);

  return updated;
}

/*
 * ---------------------------------------------------------
 * EXTERNAL STORE SUBSCRIPTION
 * ---------------------------------------------------------
 */

function subscribeToRecentSearches(
  callback: () => void,
) {
  window.addEventListener(
    "storage",
    callback,
  );

  window.addEventListener(
    RECENT_SEARCHES_EVENT,
    callback,
  );

  return () => {
    window.removeEventListener(
      "storage",
      callback,
    );

    window.removeEventListener(
      RECENT_SEARCHES_EVENT,
      callback,
    );
  };
}

/*
 * ---------------------------------------------------------
 * GLOBAL SEARCH COMPONENT
 * ---------------------------------------------------------
 */

export function GlobalSearch({
  initialData,
  initialFilter = "all",
}: GlobalSearchProps) {
  const router = useRouter();

  /*
   * Search text currently shown in the input.
   */
  const [query, setQuery] =
    useState(initialData.query);

  /*
   * Currently selected search category.
   */
  const [filter, setFilter] =
    useState<SearchFilter>(
      initialFilter,
    );

  /*
   * -------------------------------------------------------
   * RECENT SEARCHES
   * -------------------------------------------------------
   *
   * IMPORTANT:
   *
   * useSyncExternalStore receives a STRING snapshot.
   *
   * This is stable because localStorage returns
   * the same string until the value actually changes.
   */
  const recentSearchesSnapshot =
    useSyncExternalStore(
      subscribeToRecentSearches,
      getRecentSearchesSnapshot,
      getServerRecentSearchesSnapshot,
    );

  /*
   * Convert the snapshot string into an array.
   *
   * useMemo ensures the array is not recreated
   * unnecessarily.
   */
  const recentSearches =
    useMemo(
      () =>
        parseRecentSearches(
          recentSearchesSnapshot,
        ),
      [recentSearchesSnapshot],
    );

  /*
   * -------------------------------------------------------
   * KEYBOARD SHORTCUT
   * -------------------------------------------------------
   *
   * Ctrl + K on Windows/Linux
   * Cmd + K on macOS
   */

  useEffect(() => {
    function handleKeyboardShortcut(
      event: KeyboardEvent,
    ) {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();

        const input =
          document.getElementById(
            "global-search-input",
          ) as HTMLInputElement | null;

        input?.focus();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyboardShortcut,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboardShortcut,
      );
    };
  }, []);

  /*
   * -------------------------------------------------------
   * NAVIGATE TO SEARCH
   * -------------------------------------------------------
   */

  function navigateToSearch(
    searchQuery: string,
    searchFilter: SearchFilter = filter,
  ) {
    const cleanQuery =
      searchQuery.trim();

    const params =
      new URLSearchParams();

    if (cleanQuery) {
      params.set(
        "q",
        cleanQuery,
      );
    }

    if (
      searchFilter !== "all"
    ) {
      params.set(
        "type",
        searchFilter,
      );
    }

    const queryString =
      params.toString();

    router.push(
      queryString
        ? `/search?${queryString}`
        : "/search",
    );
  }

  /*
   * -------------------------------------------------------
   * SEARCH SUBMIT
   * -------------------------------------------------------
   */

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanQuery =
      query.trim();

    /*
     * Do not search for one-character
     * queries.
     */
    if (
      cleanQuery.length < 2
    ) {
      return;
    }

    /*
     * Save the search.
     *
     * saveRecentSearches() dispatches the
     * custom store event, so the recent
     * searches UI updates automatically.
     */
    addToRecentSearches(
      cleanQuery,
    );

    navigateToSearch(
      cleanQuery,
      filter,
    );
  }

  /*
   * -------------------------------------------------------
   * RECENT SEARCH
   * -------------------------------------------------------
   */

  function handleRecentSearch(
    value: string,
  ) {
    setQuery(value);

    addToRecentSearches(
      value,
    );

    navigateToSearch(
      value,
      filter,
    );
  }

  /*
   * -------------------------------------------------------
   * FILTER CHANGE
   * -------------------------------------------------------
   */

  function handleFilterChange(
    nextFilter: SearchFilter,
  ) {
    setFilter(nextFilter);

    navigateToSearch(
      query,
      nextFilter,
    );
  }

  /*
   * -------------------------------------------------------
   * CLEAR RECENT SEARCHES
   * -------------------------------------------------------
   */

  function handleClearRecentSearches() {
    saveRecentSearches([]);
  }

  /*
   * -------------------------------------------------------
   * CLEAR CURRENT SEARCH
   * -------------------------------------------------------
   */

  function handleClearSearch() {
    setQuery("");

    setFilter("all");

    router.push("/search");
  }

  /*
   * Show recent searches only when the
   * current search box is empty.
   */
  const showRecentSearches =
    !query.trim() &&
    recentSearches.length > 0;

  /*
   * -------------------------------------------------------
   * UI
   * -------------------------------------------------------
   */

  return (
    <div className="space-y-6">
      {/* =================================================
          SEARCH INPUT
          ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="relative"
      >
        <label
          htmlFor="global-search-input"
          className="sr-only"
        >
          Search CampusMate
        </label>

        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg"
          aria-hidden="true"
        >
          🔎
        </span>

        <input
          id="global-search-input"
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(
              event.target.value,
            )
          }
          placeholder="Search subjects, assignments, notices, resources..."
          autoComplete="off"
          className="w-full rounded-2xl border border-border bg-background py-4 pl-12 pr-24 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />

        <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground sm:block">
          Ctrl K
        </kbd>
      </form>

      {/* =================================================
          RECENT SEARCHES
          ================================================= */}

      {showRecentSearches && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Recent searches
            </h2>

            <button
              type="button"
              onClick={
                handleClearRecentSearches
              }
              className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentSearches.map(
              (search) => (
                <button
                  key={search}
                  type="button"
                  onClick={() =>
                    handleRecentSearch(
                      search,
                    )
                  }
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-brand-300 hover:text-brand-700"
                >
                  {search}
                </button>
              ),
            )}
          </div>
        </section>
      )}

      {/* =================================================
          SEARCH RESULTS
          ================================================= */}

      <section className="space-y-4">
        {/* FILTERS */}

        <SearchFilters
          value={filter}
          onChange={
            handleFilterChange
          }
        />

        {/* RESULT HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {query.trim()
                ? "Search results"
                : "CampusMate"}
            </h2>

            {query.trim() && (
              <p className="mt-1 text-xs text-muted-foreground">
                {initialData.total}{" "}
                result
                {initialData.total ===
                1
                  ? ""
                  : "s"}{" "}
                found
              </p>
            )}
          </div>

          {query.trim() && (
            <button
              type="button"
              onClick={
                handleClearSearch
              }
              className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Clear search
            </button>
          )}
        </div>

        {/* RESULTS */}

        <SearchResults
          results={
            initialData.results
          }
        />
      </section>
    </div>
  );
}