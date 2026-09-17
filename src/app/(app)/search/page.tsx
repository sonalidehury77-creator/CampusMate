import { PageHeader } from "@/components/layout/page-header";
import { GlobalSearch } from "@/components/global-search/global-search";
import { searchCampus } from "@/services/global-search/global-search-data";
import type { SearchFilter } from "@/types/global-search";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
};

const validFilters: SearchFilter[] = [
  "all",
  "subject",
  "assignment",
  "notice",
  "timetable",
  "resource",
  "note",
  "study_plan",
  "study_task",
  "exam",
];

function getSearchFilter(value: string | undefined): SearchFilter {
  if (value && validFilters.includes(value as SearchFilter)) {
    return value as SearchFilter;
  }

  return "all";
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const query = params.q?.trim() ?? "";
  const filter = getSearchFilter(params.type);

  let initialData;

  try {
    initialData = await searchCampus(query, filter);
  } catch {
    initialData = {
      query,
      results: [],
      total: 0,
    };
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Campus Intelligence"
        title="Global Search"
        description="Find your academic information, assignments, notices, timetable and study activity from one place."
      />

      <GlobalSearch
        key={`${query}-${filter}`}
        initialData={initialData}
        initialFilter={filter}
      />
    </div>
  );
}