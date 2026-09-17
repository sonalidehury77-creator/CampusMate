"use server";

import {
  searchCampus,
} from "@/services/global-search/global-search-data";

import type {
  GlobalSearchResponse,
  SearchFilter,
} from "@/types/global-search";

export async function globalSearchAction(
  query: string,
  filter: SearchFilter = "all",
): Promise<GlobalSearchResponse> {
  return searchCampus(
    query,
    filter,
  );
}