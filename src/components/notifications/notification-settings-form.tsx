"use client";

import { useState, useTransition } from "react";

import { updateAdvancedNotificationSettings } from "@/app/(app)/notification-settings/actions";
import type { NotificationSettings } from "@/types/notification-settings";

type NotificationSettingsFormProps = {
  initialSettings: NotificationSettings;
};

type BooleanSettingKey =
  | "assignmentNotifications"
  | "noticeNotifications"
  | "attendanceNotifications"
  | "timetableNotifications"
  | "eventNotifications"
  | "aiNotifications"
  | "reminderNotifications"
  | "emailNotifications"
  | "pushNotifications"
  | "quietHoursEnabled";

export function NotificationSettingsForm({
  initialSettings,
}: NotificationSettingsFormProps) {
  const [settings, setSettings] =
    useState(initialSettings);

  const [isPending, startTransition] =
    useTransition();

  const [message, setMessage] =
    useState<string | null>(null);

  function updateBoolean(
    key: BooleanSettingKey,
  ) {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function saveSettings() {
    setMessage(null);

    startTransition(async () => {
      try {
        await updateAdvancedNotificationSettings(
          settings,
        );

        setMessage(
          "Notification settings saved successfully.",
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to save settings.",
        );
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* GENERAL NOTIFICATIONS */}

      <section className="rounded-2xl border border-border bg-background p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Notification sources
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Choose which CampusMate areas can create
            notifications for you.
          </p>
        </div>

        <div className="space-y-3">
          {[
            [
              "assignmentNotifications",
              "Assignments",
              "Due dates, overdue work and assignment reminders.",
            ],
            [
              "noticeNotifications",
              "Notices",
              "Important college notices and notice deadlines.",
            ],
            [
              "attendanceNotifications",
              "Attendance",
              "Attendance warnings when a subject falls below the 75% target.",
            ],
            [
              "timetableNotifications",
              "Timetable",
              "Reminders shortly before your classes.",
            ],
            [
              "eventNotifications",
              "Events",
              "Campus events and future event reminders.",
            ],
            [
              "aiNotifications",
              "CampusMate AI",
              "AI-generated academic reminders and future AI alerts.",
            ],
          ].map(
            ([key, title, description]) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={
                    settings[
                      key as BooleanSettingKey
                    ]
                  }
                  onChange={() =>
                    updateBoolean(
                      key as BooleanSettingKey,
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-border"
                />

                <span>
                  <span className="block text-sm font-medium">
                    {title}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {description}
                  </span>
                </span>
              </label>
            ),
          )}
        </div>
      </section>

      {/* SMART REMINDERS */}

      <section className="rounded-2xl border border-border bg-background p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Intelligent reminders
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Control how far ahead CampusMate should
            look for upcoming academic deadlines.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
            <input
              type="checkbox"
              checked={
                settings.reminderNotifications
              }
              onChange={() =>
                updateBoolean(
                  "reminderNotifications",
                )
              }
              className="mt-1 h-4 w-4 rounded border-border"
            />

            <span>
              <span className="block text-sm font-medium">
                Smart reminders
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                Allow CampusMate to generate intelligent
                reminders from your academic activity.
              </span>
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">
                Assignment reminder window
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                Days before an assignment.
              </span>

              <input
                type="number"
                min={0}
                max={7}
                value={
                  settings.assignmentReminderDays
                }
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    assignmentReminderDays:
                      Number(
                        event.target.value,
                      ),
                  }))
                }
                className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">
                Notice reminder window
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                Days before a notice deadline.
              </span>

              <input
                type="number"
                min={0}
                max={7}
                value={
                  settings.noticeReminderDays
                }
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    noticeReminderDays:
                      Number(
                        event.target.value,
                      ),
                  }))
                }
                className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">
                Exam reminder window
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                Days before an exam.
              </span>

              <input
                type="number"
                min={0}
                max={14}
                value={
                  settings.examReminderDays
                }
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    examReminderDays:
                      Number(
                        event.target.value,
                      ),
                  }))
                }
                className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">
                Class reminder
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                Minutes before a class.
              </span>

              <input
                type="number"
                min={5}
                max={60}
                value={
                  settings.timetableReminderMinutes
                }
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    timetableReminderMinutes:
                      Number(
                        event.target.value,
                      ),
                  }))
                }
                className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </label>
          </div>
        </div>
      </section>

      {/* QUIET HOURS */}

      <section className="rounded-2xl border border-border bg-background p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Quiet hours
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            CampusMate will avoid generating smart
            reminders during your quiet period.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
          <input
            type="checkbox"
            checked={
              settings.quietHoursEnabled
            }
            onChange={() =>
              updateBoolean(
                "quietHoursEnabled",
              )
            }
            className="mt-1 h-4 w-4 rounded border-border"
          />

          <span>
            <span className="block text-sm font-medium">
              Enable quiet hours
            </span>

            <span className="mt-1 block text-xs text-muted-foreground">
              Useful for avoiding unnecessary academic
              reminders at night.
            </span>
          </span>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="text-sm font-medium">
              Start
            </span>

            <input
              type="time"
              value={
                settings.quietHoursStart
              }
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  quietHoursStart:
                    event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </label>

          <label>
            <span className="text-sm font-medium">
              End
            </span>

            <input
              type="time"
              value={
                settings.quietHoursEnd
              }
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  quietHoursEnd:
                    event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </label>
        </div>
      </section>

      {/* DELIVERY */}

      <section className="rounded-2xl border border-border bg-background p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Delivery preferences
          </h2>
        </div>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
            <input
              type="checkbox"
              checked={
                settings.emailNotifications
              }
              onChange={() =>
                updateBoolean(
                  "emailNotifications",
                )
              }
              className="mt-1 h-4 w-4 rounded border-border"
            />

            <span>
              <span className="block text-sm font-medium">
                Email notifications
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                Keep email delivery enabled for future
                notification integrations.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
            <input
              type="checkbox"
              checked={
                settings.pushNotifications
              }
              onChange={() =>
                updateBoolean(
                  "pushNotifications",
                )
              }
              className="mt-1 h-4 w-4 rounded border-border"
            />

            <span>
              <span className="block text-sm font-medium">
                Push notifications
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                Prepare CampusMate for browser/PWA push
                delivery.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* SAVE */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className="text-sm text-muted-foreground"
          aria-live="polite"
        >
          {message}
        </p>

        <button
          type="button"
          disabled={isPending}
          onClick={saveSettings}
          className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Saving..."
            : "Save notification settings"}
        </button>
      </div>
    </div>
  );
}