export type SearchResultType =
  | "subject"
  | "assignment"
  | "notice"
  | "timetable"
  | "resource"
  | "note"
  | "study_plan"
  | "study_task"
  | "exam";

export type GlobalSearchResultType = SearchResultType;

export type SearchFilter = "all" | SearchResultType;

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  metadata: string;
  href: string;
  relevance: number;
};

export type GlobalSearchItem = SearchResult;

export type GlobalSearchResult = SearchResult;

export type GlobalSearchResponse = {
  results: SearchResult[];
  total: number;
  query: string;
};