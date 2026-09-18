import { createClient } from "@/lib/supabase/server";

import type { NotificationSettings } from "@/types/notification-settings";

const defaultSettings: NotificationSettings = {
  assignmentNotifications: true,
  noticeNotifications: true,
  attendanceNotifications: true,
  timetableNotifications: true,
  eventNotifications: true,
  aiNotifications: true,

  reminderNotifications: true,

  emailNotifications: true,
  pushNotifications: true,

  assignmentReminderDays: 1,
  noticeReminderDays: 1,
  examReminderDays: 7,
  timetableReminderMinutes: 15,

  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
};

export async function getNotificationSettingsData(): Promise<{
  settings: NotificationSettings;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .select(
      `
        assignment_notifications,
        notice_notifications,
        attendance_notifications,
        timetable_notifications,
        event_notifications,
        ai_notifications,
        reminder_notifications,
        email_notifications,
        push_notifications,
        assignment_reminder_days,
        notice_reminder_days,
        exam_reminder_days,
        timetable_reminder_minutes,
        quiet_hours_enabled,
        quiet_hours_start,
        quiet_hours_end
      `,
    )
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load notification settings: ${error.message}`,
    );
  }

  if (!data) {
    return {
      settings: defaultSettings,
    };
  }

  return {
    settings: {
      assignmentNotifications:
        data.assignment_notifications,

      noticeNotifications:
        data.notice_notifications,

      attendanceNotifications:
        data.attendance_notifications,

      timetableNotifications:
        data.timetable_notifications,

      eventNotifications:
        data.event_notifications,

      aiNotifications:
        data.ai_notifications,

      reminderNotifications:
        data.reminder_notifications,

      emailNotifications:
        data.email_notifications,

      pushNotifications:
        data.push_notifications,

      assignmentReminderDays:
        data.assignment_reminder_days,

      noticeReminderDays:
        data.notice_reminder_days,

      examReminderDays:
        data.exam_reminder_days,

      timetableReminderMinutes:
        data.timetable_reminder_minutes,

      quietHoursEnabled:
        data.quiet_hours_enabled,

      quietHoursStart:
        data.quiet_hours_start.slice(0, 5),

      quietHoursEnd:
        data.quiet_hours_end.slice(0, 5),
    },
  };
}