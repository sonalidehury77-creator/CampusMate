"use client";

import { useTransition } from "react";

import { refreshSmartReminders } from "@/app/(app)/notification-settings/actions";

export function RefreshRemindersButton() {
  const [isPending, startTransition] =
    useTransition();

  function handleRefresh() {
    startTransition(async () => {
      try {
        await refreshSmartReminders();
      } catch {
        // The notifications page will remain usable
        // even if reminder refresh fails.
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleRefresh}
      className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending
        ? "Checking..."
        : "Refresh smart reminders"}
    </button>
  );
}
