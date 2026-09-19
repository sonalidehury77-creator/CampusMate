"use client";

import Link from "next/link";
import { useTransition } from "react";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/app/(app)/notices/actions";

import type { Notification } from "@/types/notifications";

type NotificationCenterProps = {
  notifications: Notification[];
  unreadCount: number;
};

function formatNotificationTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getNotificationHref(
  relatedEntityType: string | null,
  relatedEntityId: string | null,
) {
  if (!relatedEntityType || !relatedEntityId) {
    return null;
  }

  switch (relatedEntityType) {
    case "notice":
      return `/notices/${relatedEntityId}`;

    case "assignment":
      return "/assignments";

    case "exam":
      return "/academics";

    case "timetable":
      return "/timetable";

    case "study_task":
      return "/study-planner";

    case "attendance":
      return "/attendance";

    default:
      return "/notifications";
  }
}

export function NotificationCenter({
  notifications,
  unreadCount,
}: NotificationCenterProps) {
  const [isPending, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(() => {
      void markNotificationAsRead(id);
    });
  }

  function markAllRead() {
    startTransition(() => {
      void markAllNotificationsAsRead();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={isPending}
            onClick={markAllRead}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
          >
            {isPending ? "Updating..." : "Mark all as read"}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <h2 className="font-semibold">You&apos;re all caught up.</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            New CampusMate notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const unread = !notification.readAt;

            const relatedHref = getNotificationHref(
              notification.relatedEntityType,
              notification.relatedEntityId,
            );

            return (
              <article
                key={notification.id}
                className={`rounded-2xl border p-5 transition ${
                  unread
                    ? "border-brand-200 bg-brand-50/40"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                      unread ? "bg-brand-500" : "bg-muted"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{notification.title}</h2>

                      <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                        {notification.priority}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {notification.message}
                    </p>

                    <p className="mt-3 text-xs text-muted-foreground">
                      {notification.type} ·{" "}
                      {formatNotificationTime(notification.createdAt)}
                    </p>

                    {relatedHref && (
                      <Link
                        href={relatedHref}
                        className="mt-3 inline-flex text-xs font-semibold text-brand-700 transition hover:text-brand-800"
                      >
                        Open related item →
                      </Link>
                    )}
                  </div>

                  {unread && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => markRead(notification.id)}
                      className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                    >
                      {isPending ? "..." : "Mark read"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
