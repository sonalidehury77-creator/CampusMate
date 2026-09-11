export type ScheduleType =
  | "lecture"
  | "laboratory"
  | "tutorial"
  | "seminar"
  | "other";

export type TimetableEntry = {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string | null;
  facultyName: string | null;
  semesterId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  scheduleType: ScheduleType;
  durationMinutes: number;
};

export type TimetableDay = {
  dayOfWeek: number;
  label: string;
  shortLabel: string;
  entries: TimetableEntry[];
};

export type FreePeriod = {
  startTime: string;
  endTime: string;
  durationMinutes: number;
};

export type TimetableData = {
  todayDayOfWeek: number;
  todayLabel: string;
  todayEntries: TimetableEntry[];
  weeklySchedule: TimetableDay[];
  nextClass: TimetableEntry | null;
  currentClass: TimetableEntry | null;
  freePeriods: FreePeriod[];
};