import { createClient } from "@/lib/supabase/server";

import type {
  Exam,
  ExamData,
} from "@/types/exams";

function getTodayInIndia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function sortByDate(
  a: Exam,
  b: Exam,
) {
  return (
    a.examDate.localeCompare(b.examDate) ||
    (a.startTime ?? "").localeCompare(
      b.startTime ?? "",
    )
  );
}

export async function getExamsData(): Promise<ExamData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select(
        `
          id,
          semester_id
        `,
      )
      .eq("profile_id", user.id)
      .maybeSingle();

  if (studentError) {
    throw new Error(
      `Failed to load student: ${studentError.message}`,
    );
  }

  if (!student) {
    throw new Error(
      "Student profile is not configured.",
    );
  }

  const { data: examRows, error: examError } =
    await supabase
      .from("exams")
      .select(
        `
          id,
          subject_id,
          semester_id,
          exam_type,
          exam_date,
          start_time,
          end_time,
          room,
          subjects (
            code,
            name
          )
        `,
      )
      .eq("semester_id", student.semester_id)
      .order("exam_date", {
        ascending: true,
      })
      .order("start_time", {
        ascending: true,
      });

  if (examError) {
    throw new Error(
      `Failed to load exams: ${examError.message}`,
    );
  }

  const exams: Exam[] = (examRows ?? []).map(
    (row) => {
      const subject = Array.isArray(row.subjects)
        ? row.subjects[0]
        : row.subjects;

      return {
        id: row.id,
        subjectId: row.subject_id,
        subjectCode: subject?.code ?? "—",
        subjectName:
          subject?.name ?? "Unknown subject",
        semesterId: row.semester_id,
        examType: row.exam_type,
        examDate: row.exam_date,
        startTime: row.start_time,
        endTime: row.end_time,
        room: row.room,
      };
    },
  );

  const today = getTodayInIndia();

  const upcomingExams = exams
    .filter(
      (exam) =>
        exam.examDate >= today,
    )
    .sort(sortByDate);

  const completedExams = exams
    .filter(
      (exam) =>
        exam.examDate < today,
    )
    .sort(sortByDate)
    .reverse();

  const todayExams = exams.filter(
    (exam) =>
      exam.examDate === today,
  );

  return {
    exams,
    upcomingExams,
    completedExams,
    todayExams,
    nextExam:
      upcomingExams.length > 0
        ? upcomingExams[0]
        : null,
  };
}