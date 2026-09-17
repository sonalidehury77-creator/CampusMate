import type { SearchResultType } from "@/types/global-search";

type SearchResultIconProps = {
  type: SearchResultType;
};

const icons: Record<SearchResultType, string> = {
  subject: "📚",
  assignment: "📝",
  notice: "📢",
  timetable: "🗓️",
  resource: "📄",
  note: "📒",
  study_plan: "📅",
  study_task: "✅",
  exam: "🎓",
};

export function SearchResultIcon({
  type,
}: SearchResultIconProps) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg"
      aria-hidden="true"
    >
      {icons[type]}
    </span>
  );
}