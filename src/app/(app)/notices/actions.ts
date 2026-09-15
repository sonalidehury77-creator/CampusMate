"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const noticeIdSchema =
  z.string().uuid();

const preferenceSchema =
  z.object({
    assignmentNotifications:
      z.boolean(),
    noticeNotifications:
      z.boolean(),
    attendanceNotifications:
      z.boolean(),
    timetableNotifications:
      z.boolean(),
    eventNotifications:
      z.boolean(),
    aiNotifications:
      z.boolean(),
    emailNotifications:
      z.boolean(),
    pushNotifications:
      z.boolean(),
  });

export async function markNotificationAsRead(
  notificationId: string,
) {
  const parsed =
    noticeIdSchema.safeParse(
      notificationId,
    );

  if (!parsed.success) {
    throw new Error(
      "Invalid notification ID.",
    );
  }

  const supabase =
    await createClient();

  const {
    error,
  } = await supabase
    .from("notifications")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq("id", parsed.data);

  if (error) {
    throw new Error(
      `Failed to mark notification as read: ${error.message}`,
    );
  }

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  revalidatePath("/notices");
}

export async function markAllNotificationsAsRead() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  const {
    error,
  } = await supabase
    .from("notifications")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq(
      "recipient_profile_id",
      user.id,
    )
    .is("read_at", null);

  if (error) {
    throw new Error(
      `Failed to mark notifications as read: ${error.message}`,
    );
  }

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  revalidatePath("/notices");
}

export async function updateNotificationPreferences(
  input: unknown,
) {
  const parsed =
    preferenceSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      "Invalid notification preferences.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  const {
    error,
  } = await supabase
    .from(
      "notification_preferences",
    )
    .upsert(
      {
        profile_id: user.id,

        assignment_notifications:
          parsed.data
            .assignmentNotifications,

        notice_notifications:
          parsed.data
            .noticeNotifications,

        attendance_notifications:
          parsed.data
            .attendanceNotifications,

        timetable_notifications:
          parsed.data
            .timetableNotifications,

        event_notifications:
          parsed.data
            .eventNotifications,

        ai_notifications:
          parsed.data
            .aiNotifications,

        email_notifications:
          parsed.data
            .emailNotifications,

        push_notifications:
          parsed.data
            .pushNotifications,
      },
      {
        onConflict:
          "profile_id",
      },
    );

  if (error) {
    throw new Error(
      `Failed to update notification preferences: ${error.message}`,
    );
  }

  revalidatePath("/notifications");
}