import { createClient } from "@/lib/supabase/server";

import type {
  Notification,
  NotificationPreferences,
  NotificationType,
  NotificationPriority,
  NotificationsData,
} from "@/types/notifications";

type NotificationRow = {
  id: string;
  recipient_profile_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  related_entity_type: string | null;
  related_entity_id: string | null;
  read_at: string | null;
  created_at: string;
};

type PreferenceRow = {
  id: string;
  profile_id: string;

  assignment_notifications: boolean;
  notice_notifications: boolean;
  attendance_notifications: boolean;
  timetable_notifications: boolean;
  event_notifications: boolean;
  ai_notifications: boolean;

  exam_notifications: boolean;
  study_task_notifications: boolean;
  reminder_notifications: boolean;

  email_notifications: boolean;
  push_notifications: boolean;

  updated_at: string;
};

export async function getNotificationsData(): Promise<NotificationsData> {
  const supabase = await createClient();

  // ============================================================
  // 1. LOAD NOTIFICATIONS
  // ============================================================

  const {
    data: notificationData,
    error: notificationError,
  } = await supabase
    .from("notifications")
    .select(
      `
        id,
        recipient_profile_id,
        title,
        message,
        type,
        priority,
        related_entity_type,
        related_entity_id,
        read_at,
        created_at
      `,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  if (notificationError) {
    throw new Error(
      `Failed to load notifications: ${notificationError.message}`,
    );
  }

  // ============================================================
  // 2. LOAD NOTIFICATION PREFERENCES
  // ============================================================

  const {
    data: preferenceData,
    error: preferenceError,
  } = await supabase
    .from("notification_preferences")
    .select(
      `
        id,
        profile_id,
        assignment_notifications,
        notice_notifications,
        attendance_notifications,
        timetable_notifications,
        event_notifications,
        ai_notifications,
        exam_notifications,
        study_task_notifications,
        reminder_notifications,
        email_notifications,
        push_notifications,
        updated_at
      `,
    )
    .maybeSingle();

  if (preferenceError) {
    throw new Error(
      `Failed to load notification preferences: ${preferenceError.message}`,
    );
  }

  // ============================================================
  // 3. CONVERT NOTIFICATION DATABASE ROWS
  //    INTO APPLICATION NOTIFICATION OBJECTS
  // ============================================================

  const notifications: Notification[] = (
    notificationData ?? []
  ).map((notification) => {
    const row = notification as NotificationRow;

    return {
      id: row.id,

      recipientProfileId: row.recipient_profile_id,

      title: row.title,

      message: row.message,

      type: row.type,

      priority: row.priority,

      relatedEntityType: row.related_entity_type,

      relatedEntityId: row.related_entity_id,

      readAt: row.read_at,

      createdAt: row.created_at,
    };
  });

  // ============================================================
  // 4. CONVERT PREFERENCE DATABASE ROW
  //    INTO APPLICATION NOTIFICATION PREFERENCES
  // ============================================================

  const preferencesRow = preferenceData as PreferenceRow | null;

  const preferences: NotificationPreferences = preferencesRow
    ? {
        id: preferencesRow.id,

        profileId: preferencesRow.profile_id,

        assignmentNotifications:
          preferencesRow.assignment_notifications,

        noticeNotifications:
          preferencesRow.notice_notifications,

        attendanceNotifications:
          preferencesRow.attendance_notifications,

        timetableNotifications:
          preferencesRow.timetable_notifications,

        eventNotifications:
          preferencesRow.event_notifications,

        aiNotifications:
          preferencesRow.ai_notifications,

        // ======================================================
        // PHASE 19 — NEW NOTIFICATION PREFERENCES
        // ======================================================

        examNotifications:
          preferencesRow.exam_notifications,

        studyTaskNotifications:
          preferencesRow.study_task_notifications,

        reminderNotifications:
          preferencesRow.reminder_notifications,

        // ======================================================
        // DELIVERY PREFERENCES
        // ======================================================

        emailNotifications:
          preferencesRow.email_notifications,

        pushNotifications:
          preferencesRow.push_notifications,

        updatedAt:
          preferencesRow.updated_at,
      }
    : {
        // ======================================================
        // DEFAULT PREFERENCES
        // Used if no preference row exists
        // ======================================================

        id: "",

        profileId: "",

        assignmentNotifications: true,

        noticeNotifications: true,

        attendanceNotifications: true,

        timetableNotifications: true,

        eventNotifications: true,

        aiNotifications: true,

        // Phase 19 defaults
        examNotifications: true,

        studyTaskNotifications: true,

        reminderNotifications: true,

        emailNotifications: true,

        pushNotifications: true,

        updatedAt: "",
      };

  // ============================================================
  // 5. RETURN COMPLETE NOTIFICATIONS DATA
  // ============================================================

  return {
    notifications,

    unreadCount: notifications.filter(
      (notification) => !notification.readAt,
    ).length,

    preferences,
  };
}