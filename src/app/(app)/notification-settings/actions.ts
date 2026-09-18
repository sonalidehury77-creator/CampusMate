"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const notificationSettingsSchema = z.object({
  assignmentNotifications: z.boolean(),
  noticeNotifications: z.boolean(),
  attendanceNotifications: z.boolean(),
  timetableNotifications: z.boolean(),
  eventNotifications: z.boolean(),
  aiNotifications: z.boolean(),

  reminderNotifications: z.boolean(),

  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),

  assignmentReminderDays: z
    .number()
    .int()
    .min(0)
    .max(7),

  noticeReminderDays: z
    .number()
    .int()
    .min(0)
    .max(7),

  examReminderDays: z
    .number()
    .int()
    .min(0)
    .max(14),

  timetableReminderMinutes: z
    .number()
    .int()
    .min(5)
    .max(60),

  quietHoursEnabled: z.boolean(),

  quietHoursStart: z
    .string()
    .regex(
      /^\d{2}:\d{2}$/,
      "Invalid quiet-hours start time.",
    ),

  quietHoursEnd: z
    .string()
    .regex(
      /^\d{2}:\d{2}$/,
      "Invalid quiet-hours end time.",
    ),
});

export async function updateAdvancedNotificationSettings(
  input: unknown,
) {
  const parsed =
    notificationSettingsSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    throw new Error(
      "Invalid notification settings.",
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  const {
    assignmentNotifications,
    noticeNotifications,
    attendanceNotifications,
    timetableNotifications,
    eventNotifications,
    aiNotifications,
    reminderNotifications,
    emailNotifications,
    pushNotifications,
    assignmentReminderDays,
    noticeReminderDays,
    examReminderDays,
    timetableReminderMinutes,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
  } = parsed.data;

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        profile_id: user.id,

        assignment_notifications:
          assignmentNotifications,

        notice_notifications:
          noticeNotifications,

        attendance_notifications:
          attendanceNotifications,

        timetable_notifications:
          timetableNotifications,

        event_notifications:
          eventNotifications,

        ai_notifications:
          aiNotifications,

        reminder_notifications:
          reminderNotifications,

        email_notifications:
          emailNotifications,

        push_notifications:
          pushNotifications,

        assignment_reminder_days:
          assignmentReminderDays,

        notice_reminder_days:
          noticeReminderDays,

        exam_reminder_days:
          examReminderDays,

        timetable_reminder_minutes:
          timetableReminderMinutes,

        quiet_hours_enabled:
          quietHoursEnabled,

        quiet_hours_start:
          quietHoursStart,

        quiet_hours_end:
          quietHoursEnd,
      },
      {
        onConflict: "profile_id",
      },
    );

  if (error) {
    throw new Error(
      `Unable to save notification settings: ${error.message}`,
    );
  }

  revalidatePath(
    "/notification-settings",
  );

  revalidatePath(
    "/notifications",
  );

  revalidatePath(
    "/dashboard",
  );
}


export async function refreshSmartReminders() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  const {
    error,
  } = await supabase.rpc(
    "generate_my_smart_reminders",
  );

  if (error) {
    throw new Error(
      `Unable to refresh smart reminders: ${error.message}`,
    );
  }

  revalidatePath(
    "/notifications",
  );

  revalidatePath(
    "/dashboard",
  );
}