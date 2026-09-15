import { createClient } from "@/lib/supabase/server";

import type {
  Notice,
  NoticeCategory,
  NoticePriority,
  NoticeStatus,
  NoticesData,
} from "@/types/notices";

type NoticeRow = {
  id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  category: NoticeCategory;
  priority: NoticePriority;
  published_at: string | null;
  deadline: string | null;
  attachment_path: string | null;
  source: string | null;
  status: NoticeStatus;
  created_at: string;
  updated_at: string;
};

function getDeadlineState(
  deadline: string | null,
): {
  daysRemaining: number | null;
  isOverdue: boolean;
  isDeadlineSoon: boolean;
} {
  if (!deadline) {
    return {
      daysRemaining: null,
      isOverdue: false,
      isDeadlineSoon: false,
    };
  }

  const now = new Date();
  const deadlineDate = new Date(deadline);

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  const difference =
    deadlineDate.getTime() - now.getTime();

  const daysRemaining = Math.ceil(
    difference / millisecondsPerDay,
  );

  return {
    daysRemaining,
    isOverdue: difference < 0,
    isDeadlineSoon:
      difference >= 0 &&
      difference <=
        7 * millisecondsPerDay,
  };
}

export async function getNoticesData(): Promise<NoticesData> {
  const supabase = await createClient();

  const {
    data: noticesData,
    error: noticesError,
  } = await supabase
    .from("notices")
    .select(
      `
        id,
        created_by,
        title,
        description,
        category,
        priority,
        published_at,
        deadline,
        attachment_path,
        source,
        status,
        created_at,
        updated_at
      `,
    )
    .eq("status", "published")
    .order("priority", {
      ascending: true,
    })
    .order("deadline", {
      ascending: true,
      nullsFirst: false,
    })
    .order("published_at", {
      ascending: false,
    });

  if (noticesError) {
    throw new Error(
      `Failed to load notices: ${noticesError.message}`,
    );
  }

  const notices =
    (noticesData ?? []) as NoticeRow[];

  const mappedNotices: Notice[] =
    await Promise.all(
      notices.map(async (notice) => {
        let attachment = null;

        if (notice.attachment_path) {
          const {
            data: signedUrlData,
          } = await supabase.storage
            .from("notices")
            .createSignedUrl(
              notice.attachment_path,
              60 * 30,
            );

          attachment = {
            path: notice.attachment_path,
            signedUrl:
              signedUrlData?.signedUrl ?? null,
          };
        }

        return {
          id: notice.id,
          createdBy: notice.created_by,
          title: notice.title,
          description: notice.description,
          category: notice.category,
          priority: notice.priority,
          publishedAt: notice.published_at,
          deadline: notice.deadline,
          attachmentPath:
            notice.attachment_path,
          source: notice.source,
          status: notice.status,
          createdAt: notice.created_at,
          updatedAt: notice.updated_at,

          attachment,

          ...getDeadlineState(
            notice.deadline,
          ),
        };
      }),
    );

  const urgent =
    mappedNotices.filter(
      (notice) =>
        notice.priority === "urgent",
    ).length;

  const important =
    mappedNotices.filter(
      (notice) =>
        notice.priority === "important",
    ).length;

  const upcomingDeadlines =
    mappedNotices.filter(
      (notice) =>
        notice.isDeadlineSoon &&
        !notice.isOverdue,
    ).length;

  const overdue =
    mappedNotices.filter(
      (notice) =>
        notice.isOverdue,
    ).length;

  const {
    count: unreadRelated,
    error: unreadError,
  } = await supabase
    .from("notifications")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("type", "notice")
    .is("read_at", null);

  if (unreadError) {
    throw new Error(
      `Failed to load notice notifications: ${unreadError.message}`,
    );
  }

  return {
    notices: mappedNotices,

    summary: {
      total: mappedNotices.length,
      urgent,
      important,
      upcomingDeadlines,
      overdue,
      unreadRelated:
        unreadRelated ?? 0,
    },
  };
}