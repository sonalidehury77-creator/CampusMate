import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";
import type {
  FreePeriod,
  TimetableData,
  TimetableDay,
  TimetableEntry,
  ScheduleType,
} from "@/types/timetable";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAY_SHORT_NAMES = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

function timeToMinutes(time: string): number {
  const [hours, minutes] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    remainingMinutes,
  ).padStart(2, "0")}`;
}

function calculateDuration(
  startTime: string,
  endTime: string,
): number {
  return (
    timeToMinutes(endTime) -
    timeToMinutes(startTime)
  );
}

function formatTime(time: string): string {
  const [hoursString, minutesString] = time
    .slice(0, 5)
    .split(":");

  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  const period = hours >= 12 ? "PM" : "AM";

  const displayHours =
    hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHours}:${String(minutes).padStart(
    2,
    "0",
  )} ${period}`;
}

function getCurrentTimeMinutes(): number {
  const formatter = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: siteConfig.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  );

  const parts = formatter.formatToParts(
    new Date(),
  );

  const hour = Number(
    parts.find((part) => part.type === "hour")
      ?.value ?? "0",
  );

  const minute = Number(
    parts.find(
      (part) => part.type === "minute",
    )?.value ?? "0",
  );

  return hour * 60 + minute;
}

function getTodayDayOfWeek(): number {
  const weekday = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: siteConfig.timezone,
      weekday: "long",
    },
  ).format(new Date());

  return DAY_NAMES.indexOf(weekday);
}

function mapScheduleType(
  value: string,
): ScheduleType {
  if (
    value === "lecture" ||
    value === "laboratory" ||
    value === "tutorial" ||
    value === "seminar"
  ) {
    return value;
  }

  return "other";
}

export function getFormattedTime(
  time: string,
): string {
  return formatTime(time);
}

export async function getTimetableData(
  userId: string,
): Promise<TimetableData> {
  const supabase = await createClient();

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select("id, semester_id")
      .eq("profile_id", userId)
      .single();

  if (studentError || !student) {
    throw new Error(
      "Unable to load your student information.",
    );
  }

  const { data: timetableRows, error } =
    await supabase
      .from("timetable_entries")
      .select(
        "id, subject_id, faculty_id, semester_id, day_of_week, start_time, end_time, room, schedule_type",
      )
      .eq("semester_id", student.semester_id)
      .order("day_of_week")
      .order("start_time");

  if (error) {
    throw new Error(
      "Unable to load your timetable.",
    );
  }

  const rows = timetableRows ?? [];

  const subjectIds = [
    ...new Set(
      rows.map((row) => row.subject_id),
    ),
  ];

  const facultyIds = [
    ...new Set(
      rows
        .map((row) => row.faculty_id)
        .filter(
          (id): id is string => Boolean(id),
        ),
    ),
  ];

  const [
    subjectsResult,
    facultyResult,
  ] = await Promise.all([
    subjectIds.length > 0
      ? supabase
          .from("subjects")
          .select("id, code, name")
          .in("id", subjectIds)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    facultyIds.length > 0
      ? supabase
          .from("faculty")
          .select(
            "id, profile_id, designation",
          )
          .in("id", facultyIds)
      : Promise.resolve({
          data: [],
          error: null,
        }),
  ]);

  if (subjectsResult.error) {
    throw new Error(
      "Unable to load timetable subjects.",
    );
  }

  if (facultyResult.error) {
    throw new Error(
      "Unable to load timetable faculty.",
    );
  }

  const subjectMap = new Map(
    (subjectsResult.data ?? []).map(
      (subject) => [
        subject.id,
        {
          code: subject.code,
          name: subject.name,
        },
      ],
    ),
  );

  const facultyMap = new Map(
    (facultyResult.data ?? []).map(
      (faculty) => [
        faculty.id,
        {
          profileId: faculty.profile_id,
          designation: faculty.designation,
        },
      ],
    ),
  );

  const facultyProfileIds = [
    ...new Set(
      (facultyResult.data ?? [])
        .map((faculty) => faculty.profile_id)
        .filter(
          (id): id is string => Boolean(id),
        ),
    ),
  ];

  const { data: facultyProfiles } =
    facultyProfileIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", facultyProfileIds)
      : { data: [] };

  const facultyProfileMap = new Map(
    (facultyProfiles ?? []).map(
      (profile) => [
        profile.id,
        profile.full_name,
      ],
    ),
  );

  const entries: TimetableEntry[] =
    rows.map((row) => {
      const subject =
        subjectMap.get(row.subject_id);

      const faculty = row.faculty_id
        ? facultyMap.get(row.faculty_id)
        : null;

      const facultyName =
        faculty?.profileId
          ? facultyProfileMap.get(
              faculty.profileId,
            ) ?? null
          : null;

      return {
        id: row.id,
        subjectId: row.subject_id,
        subjectCode:
          subject?.code ?? "Unknown",
        subjectName:
          subject?.name ??
          "Unknown subject",
        facultyId: row.faculty_id,
        facultyName,
        semesterId: row.semester_id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time,
        room: row.room,
        scheduleType:
          mapScheduleType(
            row.schedule_type,
          ),
        durationMinutes:
          calculateDuration(
            row.start_time,
            row.end_time,
          ),
      };
    });

  const todayDayOfWeek =
    getTodayDayOfWeek();

  const todayEntries = entries.filter(
    (entry) =>
      entry.dayOfWeek ===
      todayDayOfWeek,
  );

  const currentTime =
    getCurrentTimeMinutes();

  const currentClass =
    todayEntries.find((entry) => {
      const start = timeToMinutes(
        entry.startTime,
      );

      const end = timeToMinutes(
        entry.endTime,
      );

      return (
        currentTime >= start &&
        currentTime < end
      );
    }) ?? null;

  const nextClass =
    todayEntries.find(
      (entry) =>
        timeToMinutes(entry.startTime) >
        currentTime,
    ) ?? null;

  const weeklySchedule: TimetableDay[] =
    DAY_NAMES.map((label, dayOfWeek) => ({
      dayOfWeek,
      label,
      shortLabel:
        DAY_SHORT_NAMES[dayOfWeek],
      entries: entries.filter(
        (entry) =>
          entry.dayOfWeek ===
          dayOfWeek,
      ),
    }));

  const freePeriods: FreePeriod[] = [];

  const sortedTodayEntries = [
    ...todayEntries,
  ].sort(
    (a, b) =>
      timeToMinutes(a.startTime) -
      timeToMinutes(b.startTime),
  );

  for (
    let index = 0;
    index <
    sortedTodayEntries.length - 1;
    index += 1
  ) {
    const current =
      sortedTodayEntries[index];

    const next =
      sortedTodayEntries[index + 1];

    const currentEnd =
      timeToMinutes(current.endTime);

    const nextStart =
      timeToMinutes(next.startTime);

    const gap =
      nextStart - currentEnd;

    if (gap >= 30) {
      freePeriods.push({
        startTime:
          minutesToTime(currentEnd),
        endTime:
          minutesToTime(nextStart),
        durationMinutes: gap,
      });
    }
  }

  return {
    todayDayOfWeek,
    todayLabel:
      DAY_NAMES[todayDayOfWeek],
    todayEntries,
    weeklySchedule,
    nextClass,
    currentClass,
    freePeriods,
  };
}