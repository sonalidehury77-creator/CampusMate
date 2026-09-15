export type NotificationType =
  | "assignment"
  | "notice"
  | "timetable"
  | "attendance"
  | "reminder"
  | "event"
  | "system"
  | "ai";

export type NotificationPriority =
  | "urgent"
  | "important"
  | "normal";

export type Notification = {
  id: string;
  recipientProfileId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationPreferences = {
  id: string;
  profileId: string;

  assignmentNotifications: boolean;
  noticeNotifications: boolean;
  attendanceNotifications: boolean;
  timetableNotifications: boolean;
  eventNotifications: boolean;
  aiNotifications: boolean;

  emailNotifications: boolean;
  pushNotifications: boolean;

  updatedAt: string;
};

export type NotificationsData = {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
};