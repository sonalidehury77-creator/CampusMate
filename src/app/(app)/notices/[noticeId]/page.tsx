import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";

type NoticePageProps = {
  params: Promise<{
    noticeId: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function formatDeadline(value: string | null) {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function priorityClasses(priority: string) {
  switch (priority.toLowerCase()) {
    case "urgent":
      return "border-red-200 bg-red-50 text-red-700";

    case "important":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function statusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "published":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "archived":
      return "border-slate-200 bg-slate-50 text-slate-600";

    case "draft":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export default async function NoticeDetailPage({
  params,
}: NoticePageProps) {
  const { noticeId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: notice, error } = await supabase
    .from("notices")
    .select(
      `
        id,
        title,
        description,
        category,
        priority,
        status,
        source,
        attachment_path,
        published_at,
        deadline,
        created_at,
        updated_at
      `,
    )
    .eq("id", noticeId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load notice:", error);
    notFound();
  }

  if (!notice) {
    notFound();
  }

  let attachmentUrl: string | null = null;

  if (notice.attachment_path) {
    const { data: signedUrlData } = await supabase.storage
      .from("notices")
      .createSignedUrl(notice.attachment_path, 60 * 30);

    attachmentUrl = signedUrlData?.signedUrl ?? null;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Campus notice"
        title={notice.title}
        description="Read the complete notice and keep track of important deadlines."
        actions={
          <Link
            href="/notices"
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            ← Back to notices
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${priorityClasses(
                notice.priority,
              )}`}
            >
              {notice.priority}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
                notice.status,
              )}`}
            >
              {notice.status}
            </span>

            <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
              {notice.category}
            </span>
          </div>

          <div className="mt-6 border-b border-border pb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {notice.title}
            </h2>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span>
                Published:{" "}
                {formatDate(notice.published_at)}
              </span>

              {notice.source && (
                <span>
                  Source: {notice.source}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Notice details
            </h3>

            {notice.description ? (
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                {notice.description}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No additional description was provided with this notice.
              </p>
            )}
          </div>

          {attachmentUrl && (
            <div className="mt-8 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Original notice attachment
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Open the original PDF or image attached to this notice.
                  </p>
                </div>

                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
                >
                  View original notice
                </a>
              </div>
            </div>
          )}
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">
              Deadline
            </h3>

            <p className="mt-3 text-sm font-medium text-foreground">
              {formatDeadline(notice.deadline)}
            </p>

            {notice.deadline && (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                CampusMate uses this deadline to help you identify
                time-sensitive notices.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-foreground">
              Notice information
            </h3>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">
                  Category
                </dt>

                <dd className="text-right font-medium capitalize text-foreground">
                  {notice.category}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">
                  Priority
                </dt>

                <dd className="text-right font-medium capitalize text-foreground">
                  {notice.priority}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">
                  Published
                </dt>

                <dd className="text-right font-medium text-foreground">
                  {formatDate(notice.published_at)}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">
                  Updated
                </dt>

                <dd className="text-right font-medium text-foreground">
                  {formatDate(notice.updated_at)}
                </dd>
              </div>
            </dl>
          </div>

          <Link
            href="/notices"
            className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            View all campus notices
          </Link>
        </aside>
      </div>
    </div>
  );
}