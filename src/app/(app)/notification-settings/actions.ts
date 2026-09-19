"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const notificationSettingsSchema = z.object({
  // ============================================================
  // NOTIFICATION CATEGORY SETTINGS
  // ============================================================

  assignmentNotifications: z.boolean(),

  noticeNotifications: z.boolean(),

  attendanceNotifications: z.boolean(),

  timetableNotifications: z.boolean(),

  eventNotifications: z.boolean(),

  aiNotifications: z.boolean(),

  // Phase 19
  examNotifications: z.boolean(),

  // Phase 19
  studyTaskNotifications: z.boolean(),

  // Phase 19
  reminderNotifications: z.boolean(),

  // ============================================================
  // DELIVERY SETTINGS
  // ============================================================

  emailNotifications: z.boolean(),

  pushNotifications: z.boolean(),

  // ============================================================
  // SMART REMINDER SETTINGS
  // ============================================================

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

  // ============================================================
  // QUIET HOURS
  // ============================================================

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
  // ============================================================
  // 1. VALIDATE INPUT
  // ============================================================

  const parsed =
    notificationSettingsSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    throw new Error(
      "Invalid notification settings.",
    );
  }

  // ============================================================
  // 2. CREATE SUPABASE SERVER CLIENT
  // ============================================================

  const supabase = await createClient();

  // ============================================================
  // 3. GET CURRENT AUTHENTICATED USER
  // ============================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  // ============================================================
  // 4. EXTRACT VALIDATED SETTINGS
  // ============================================================

  const {
    assignmentNotifications,
    noticeNotifications,
    attendanceNotifications,
    timetableNotifications,
    eventNotifications,
    aiNotifications,

    // Phase 19
    examNotifications,
    studyTaskNotifications,
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

  // ============================================================
  // 5. SAVE SETTINGS
  // ============================================================

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        profile_id: user.id,

        // --------------------------------------------------------
        // Notification categories
        // --------------------------------------------------------

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

        // --------------------------------------------------------
        // Phase 19 notification categories
        // --------------------------------------------------------

        exam_notifications:
          examNotifications,

        study_task_notifications:
          studyTaskNotifications,

        reminder_notifications:
          reminderNotifications,

        // --------------------------------------------------------
        // Delivery settings
        // --------------------------------------------------------

        email_notifications:
          emailNotifications,

        push_notifications:
          pushNotifications,

        // --------------------------------------------------------
        // Smart reminder settings
        // --------------------------------------------------------

        assignment_reminder_days:
          assignmentReminderDays,

        notice_reminder_days:
          noticeReminderDays,

        exam_reminder_days:
          examReminderDays,

        timetable_reminder_minutes:
          timetableReminderMinutes,

        // --------------------------------------------------------
        // Quiet hours
        // --------------------------------------------------------

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

  // ============================================================
  // 6. HANDLE DATABASE ERROR
  // ============================================================

  if (error) {
    throw new Error(
      `Unable to save notification settings: ${error.message}`,
    );
  }

  // ============================================================
  // 7. REFRESH RELEVANT PAGES
  // ============================================================

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

// ================================================================
// PHASE 19
// MANUALLY REFRESH SMART REMINDERS
// ================================================================

export async function refreshSmartReminders() {
  const supabase = await createClient();

  // --------------------------------------------------------------
  // 1. Verify authenticated user
  // --------------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  // --------------------------------------------------------------
  // 2. Run authenticated reminder engine
  // --------------------------------------------------------------

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

  // --------------------------------------------------------------
  // 3. Refresh notification UI
  // --------------------------------------------------------------

  revalidatePath(
    "/notifications",
  );

  revalidatePath(
    "/dashboard",
  );
}