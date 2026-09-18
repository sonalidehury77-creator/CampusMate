export type NotificationSettings = {
  assignmentNotifications: boolean;
  noticeNotifications: boolean;
  attendanceNotifications: boolean;
  timetableNotifications: boolean;
  eventNotifications: boolean;
  aiNotifications: boolean;

  reminderNotifications: boolean;

  emailNotifications: boolean;
  pushNotifications: boolean;

  assignmentReminderDays: number;
  noticeReminderDays: number;
  examReminderDays: number;
  timetableReminderMinutes: number;

  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
};