"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type NotificationBellProps = {
  profileId: string;
  initialUnreadCount: number;
};

export function NotificationBell({
  profileId,
  initialUnreadCount,
}: NotificationBellProps) {
  const [unreadCount, setUnreadCount] =
    useState(initialUnreadCount);

  useEffect(() => {
    const supabase =
      createClient();

    const channel =
      supabase
        .channel(
          `profile:${profileId}:notifications`,
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter:
              `recipient_profile_id=eq.${profileId}`,
          },
          () => {
            setUnreadCount(
              (current) =>
                current + 1,
            );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter:
              `recipient_profile_id=eq.${profileId}`,
          },
          (payload) => {
            const oldReadAt =
              payload.old &&
              "read_at" in payload.old
                ? payload.old.read_at
                : null;

            const newReadAt =
              payload.new &&
              "read_at" in payload.new
                ? payload.new.read_at
                : null;

            if (
              !oldReadAt &&
              newReadAt
            ) {
              setUnreadCount(
                (current) =>
                  Math.max(
                    0,
                    current - 1,
                  ),
              );
            }
          },
        )
        .subscribe();

    return () => {
      void supabase.removeChannel(
        channel,
      );
    };
  }, [profileId]);

  return (
    <Link
      href="/notifications"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} unread notifications`
          : "Notifications"
      }
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-lg transition hover:bg-muted"
    >
      <span aria-hidden="true">
        🔔
      </span>

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99
            ? "99+"
            : unreadCount}
        </span>
      )}
    </Link>
  );
}