import { createClient } from "@/lib/supabase/server";

import type { AIContext } from "@/types/ai";

function getToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function getDateDaysFromToday(days: number) {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export async function getAIContext(): Promise<AIContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to use CampusMate AI.");
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(
      `
        id,
        profile_id,
        student_number,
        current_semester,
        program_id,
        semester_id
      `,
    )
    .eq("profile_id", user.id)
    .maybeSingle();

  if (studentError) {
    throw new Error("Unable to load your student profile.");
  }

  if (!student) {
    throw new Error(
      "Complete your student onboarding before using CampusMate AI.",
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const { data: semester } = await supabase
    .from("semesters")
    .select(
      "id, semester_number, academic_year, program_id",
    )
    .eq("id", student.semester_id)
    .maybeSingle();

  let programName: string | null = null;
  let departmentName: string | null = null;

  if (student.program_id) {
    const { data: program } = await supabase
      .from("programs")
      .select("id, name, department_id")
      .eq("id", student.program_id)
      .maybeSingle();

    if (program) {
      programName = program.name;

      const { data: department } = await supabase
        .from("departments")
        .select("name")
        .eq("id", program.department_id)
        .maybeSingle();

      departmentName = department?.name ?? null;
    }
  }

  const { data: studentSubjects } = await supabase
    .from("student_subjects")
    .select("subject_id")
    .eq("student_id", student.id);

  const subjectIds =
    studentSubjects?.map((item) => item.subject_id) ?? [];

  let subjects: AIContext["subjects"] = [];

  if (subjectIds.length > 0) {
    const { data: subjectRows } = await supabase
      .from("subjects")
      .select("id, code, name")
      .in("id", subjectIds)
      .order("code");

    const { data: progressRows } = await supabase
      .from("student_subject_progress")
      .select(
        "subject_id, progress_percentage",
      )
      .eq("student_id", student.id)
      .in("subject_id", subjectIds);

    const progressMap = new Map(
      (progressRows ?? []).map((row) => [
        row.subject_id,
        row.progress_percentage,
      ]),
    );

    subjects = (subjectRows ?? []).map((subject) => ({
      id: subject.id,
      code: subject.code,
      name: subject.name,
      progress: progressMap.get(subject.id) ?? 0,
    }));
  }

  const { data: syllabusUnits } = await supabase
    .from("syllabus_units")
    .select(
      "id, subject_id, unit_number, title",
    )
    .in(
      "subject_id",
      subjectIds.length > 0 ? subjectIds : ["00000000-0000-0000-0000-000000000000"],
    )
    .order("unit_number");

  const { data: unitProgressRows } = await supabase
    .from("unit_progress")
    .select(
      "subject_id, unit_number, progress_percentage, completed",
    )
    .eq("student_id", student.id);

  const unitProgressMap = new Map(
    (unitProgressRows ?? []).map((row) => [
      `${row.subject_id}-${row.unit_number}`,
      row,
    ]),
  );

  const subjectMap = new Map(
    subjects.map((subject) => [subject.id, subject]),
  );

  const syllabus: AIContext["syllabus"] =
    (syllabusUnits ?? []).map((unit) => {
      const progress = unitProgressMap.get(
        `${unit.subject_id}-${unit.unit_number}`,
      );

      return {
        subjectCode:
          subjectMap.get(unit.subject_id)?.code ?? "Unknown",
        subjectName:
          subjectMap.get(unit.subject_id)?.name ?? "Unknown",
        unitNumber: unit.unit_number,
        unitTitle: unit.title,
        progress: progress?.progress_percentage ?? 0,
        completed: progress?.completed ?? false,
      };
    });

  const { data: assignments } = await supabase
    .from("assignments")
    .select(
      "id, title, subject_id, due_date, priority",
    )
    .in(
      "subject_id",
      subjectIds.length > 0 ? subjectIds : ["00000000-0000-0000-0000-000000000000"],
    )
    .order("due_date", {
      ascending: true,
      nullsFirst: false,
    })
    .limit(30);

  const assignmentSubjectMap = new Map(
    subjects.map((subject) => [subject.id, subject.name]),
  );

  const mappedAssignments: AIContext["assignments"] =
    (assignments ?? []).map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      subjectName:
        assignmentSubjectMap.get(assignment.subject_id) ??
        "Unknown subject",
      dueDate: assignment.due_date,
      priority: assignment.priority,
    }));

  const { data: attendanceSessions } = await supabase
    .from("attendance_sessions")
    .select(
      "id, subject_id, session_date",
    )
    .in(
      "subject_id",
      subjectIds.length > 0 ? subjectIds : ["00000000-0000-0000-0000-000000000000"],
    );

  const sessionIds =
    attendanceSessions?.map((session) => session.id) ?? [];

  const { data: attendanceRecords } =
    sessionIds.length > 0
      ? await supabase
          .from("attendance_records")
          .select(
            "session_id, status",
          )
          .eq("student_id", student.id)
          .in("session_id", sessionIds)
      : { data: [] };

  const sessionSubjectMap = new Map(
    (attendanceSessions ?? []).map((session) => [
      session.id,
      session.subject_id,
    ]),
  );

  const attendanceMap = new Map<
    string,
    { present: number; total: number }
  >();

  for (const record of attendanceRecords ?? []) {
    const subjectId = sessionSubjectMap.get(
      record.session_id,
    );

    if (!subjectId) continue;

    const current = attendanceMap.get(subjectId) ?? {
      present: 0,
      total: 0,
    };

    current.total += 1;

    if (
      record.status === "present" ||
      record.status === "excused"
    ) {
      current.present += 1;
    }

    attendanceMap.set(subjectId, current);
  }

  const attendance: AIContext["attendance"] =
    subjects.map((subject) => {
      const stats = attendanceMap.get(subject.id) ?? {
        present: 0,
        total: 0,
      };

      return {
        subjectCode: subject.code,
        subjectName: subject.name,
        percentage:
          stats.total === 0
            ? 0
            : Math.round(
                (stats.present / stats.total) * 100,
              ),
        present: stats.present,
        total: stats.total,
      };
    });

  const { data: timetable } = await supabase
    .from("timetable_entries")
    .select(
      "subject_id, day_of_week, start_time, end_time, room",
    )
    .eq(
      "semester_id",
      student.semester_id,
    )
    .order("day_of_week")
    .order("start_time");

  const timetableData: AIContext["timetable"] =
    (timetable ?? []).map((entry) => ({
      subjectCode:
        subjectMap.get(entry.subject_id)?.code ??
        "Unknown",
      subjectName:
        subjectMap.get(entry.subject_id)?.name ??
        "Unknown",
      dayOfWeek: entry.day_of_week,
      startTime: entry.start_time,
      endTime: entry.end_time,
      room: entry.room,
    }));

  const { data: exams } = await supabase
    .from("exams")
    .select(
      `
        id,
        subject_id,
        exam_date,
        exam_type,
        start_time,
        room
      `,
    )
    .eq("semester_id", student.semester_id)
    .gte(
      "exam_date",
      getToday(),
    )
    .order("exam_date")
    .limit(20);

  const examData: AIContext["exams"] =
    (exams ?? []).map((exam) => ({
      subjectCode:
        subjectMap.get(exam.subject_id)?.code ??
        "Unknown",
      subjectName:
        subjectMap.get(exam.subject_id)?.name ??
        "Unknown",
      examDate: exam.exam_date,
      examType: exam.exam_type,
      startTime: exam.start_time,
      room: exam.room,
    }));

  const { data: studyPlans } = await supabase
    .from("study_plans")
    .select("id")
    .eq("student_id", student.id);

  const planIds =
    studyPlans?.map((plan) => plan.id) ?? [];

  const { data: studyItems } =
    planIds.length > 0
      ? await supabase
          .from("study_plan_items")
          .select(
            `
              task,
              study_date,
              duration_minutes,
              priority,
              status,
              subject_id
            `,
          )
          .in("study_plan_id", planIds)
          .gte("study_date", getToday())
          .lte(
            "study_date",
            getDateDaysFromToday(14),
          )
          .order("study_date")
          .limit(50)
      : { data: [] };

  const studyTasks: AIContext["studyTasks"] =
    (studyItems ?? []).map((item) => ({
      task: item.task,
      studyDate: item.study_date,
      durationMinutes: item.duration_minutes,
      priority: item.priority,
      status: item.status,
      subjectName: item.subject_id
        ? subjectMap.get(item.subject_id)?.name ?? null
        : null,
    }));

  const { data: focusRows } = await supabase
    .from("focus_sessions")
    .select(
      `
        duration_minutes,
        session_type,
        started_at,
        subject_id
      `,
    )
    .eq("student_id", student.id)
    .eq("completed", true)
    .order("started_at", {
      ascending: false,
    })
    .limit(20);

  const focusSessions: AIContext["focusSessions"] =
    (focusRows ?? []).map((session) => ({
      durationMinutes:
        session.duration_minutes ?? 0,
      sessionType: session.session_type,
      startedAt: session.started_at,
      subjectName: session.subject_id
        ? subjectMap.get(session.subject_id)?.name ??
          null
        : null,
    }));

  const { data: notices } = await supabase
    .from("notices")
    .select(
      "title, category, priority, deadline",
    )
    .eq("status", "published")
    .order("deadline", {
      ascending: true,
      nullsFirst: false,
    })
    .limit(15);

  return {
    student: {
      name:
        profile?.full_name ??
        "CampusMate Student",
      studentNumber:
        student.student_number,
      semester:
        student.current_semester,
      academicYear:
        semester?.academic_year ?? null,
      program: programName,
      department: departmentName,
    },

    subjects,

    syllabus,

    assignments: mappedAssignments,

    attendance,

    timetable: timetableData,

    exams: examData,

    studyTasks,

    focusSessions,

    notices:
      (notices ?? []).map((notice) => ({
        title: notice.title,
        category: notice.category,
        priority: notice.priority,
        deadline: notice.deadline,
      })),
  };
}