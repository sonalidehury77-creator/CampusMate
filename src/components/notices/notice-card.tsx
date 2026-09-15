import Link from "next/link";

import type { Notice } from "@/types/notices";

type NoticeCardProps = {
  notice: Notice;
};

const priorityStyles = {
  urgent:
    "border-red-200 bg-red-50 text-red-700",
  important:
    "border-amber-200 bg-amber-50 text-amber-700",
  normal:
    "border-border bg-muted text-muted-foreground",
};

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

export function NoticeCard({
  notice,
}: NoticeCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${priorityStyles[notice.priority]}`}
            >
              {notice.priority}
            </span>

            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
              {notice.category}
            </span>
          </div>

          <h2 className="mt-3 text-lg font-semibold text-foreground">
            {notice.title}
          </h2>
        </div>
      </div>

      {notice.description && (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {notice.description}
        </p>
      )}

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Published
          </p>

          <p className="mt-1 font-medium">
            {formatDate(
              notice.publishedAt,
            )}
          </p>
        </div>

        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Deadline
          </p>

          <p className="mt-1 font-medium">
            {formatDate(
              notice.deadline,
            )}
          </p>
        </div>
      </div>

      {notice.deadline && (
        <div className="mt-4">
          {notice.isOverdue ? (
            <p className="text-sm font-semibold text-red-600">
              Deadline has passed
            </p>
          ) : notice.daysRemaining !==
            null ? (
            <p
              className={`text-sm font-semibold ${
                notice.isDeadlineSoon
                  ? "text-amber-600"
                  : "text-brand-600"
              }`}
            >
              {notice.daysRemaining ===
              0
                ? "Deadline is today"
                : notice.daysRemaining ===
                  1
                ? "1 day remaining"
                : `${notice.daysRemaining} days remaining`}
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {notice.source
            ? `Source: ${notice.source}`
            : "Campus notice"}
        </span>

        <Link
          href={`/notices/${notice.id}`}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
        >
          View notice
        </Link>
      </div>
    </article>
  );
}