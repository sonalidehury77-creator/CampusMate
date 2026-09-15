export type NoticeCategory =
  | "examination"
  | "assignment"
  | "scholarship"
  | "placement"
  | "event"
  | "holiday"
  | "administrative"
  | "academic"
  | "general";

export type NoticePriority =
  | "urgent"
  | "important"
  | "normal";

export type NoticeStatus =
  | "draft"
  | "published"
  | "archived";

export type NoticeAttachment = {
  path: string;
  signedUrl: string | null;
};

export type Notice = {
  id: string;
  createdBy: string | null;
  title: string;
  description: string | null;
  category: NoticeCategory;
  priority: NoticePriority;
  publishedAt: string | null;
  deadline: string | null;
  attachmentPath: string | null;
  source: string | null;
  status: NoticeStatus;
  createdAt: string;
  updatedAt: string;

  attachment: NoticeAttachment | null;

  daysRemaining: number | null;
  isOverdue: boolean;
  isDeadlineSoon: boolean;
};

export type NoticeFilters = {
  category: NoticeCategory | "";
  priority: NoticePriority | "";
  search: string;
  deadline: "all" | "upcoming" | "overdue" | "none";
};

export type NoticesData = {
  notices: Notice[];

  summary: {
    total: number;
    urgent: number;
    important: number;
    upcomingDeadlines: number;
    overdue: number;
    unreadRelated: number;
  };
};