import { createClient } from "@/lib/supabase/server";

export async function getAcademicData(userId: string) {
  const supabase = await createClient();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(
      "id, student_number, program_id, semester_id, enrollment_year, current_semester",
    )
    .eq("profile_id", userId)
    .single();

  if (studentError || !student) {
    throw new Error("Unable to load your student information.");
  }

  const { data: program } = await supabase
    .from("programs")
    .select("id, name, code, department_id")
    .eq("id", student.program_id)
    .single();

  const { data: department } = program
    ? await supabase
        .from("departments")
        .select("id, name, code")
        .eq("id", program.department_id)
        .single()
    : { data: null };

  const { data: semester } = await supabase
    .from("semesters")
    .select(
      "id, semester_number, academic_year, program_id",
    )
    .eq("id", student.semester_id)
    .single();

  if (!semester) {
    return {
      student,
      program,
      department,
      semester: null,
      subjects: [],
    };
  }

  /*
   * First preference:
   * subjects explicitly assigned to this student
   * for the current academic year.
   */
  const { data: studentSubjects } = await supabase
    .from("student_subjects")
    .select("id, subject_id, academic_year")
    .eq("student_id", student.id)
    .eq("academic_year", semester.academic_year);

  let subjectIds =
    studentSubjects?.map((item) => item.subject_id) ?? [];

  /*
   * Fallback:
   * if no explicit student_subjects exist, show the subjects
   * belonging to the student's current semester.
   */
  if (subjectIds.length === 0) {
    const { data: semesterSubjects } = await supabase
      .from("subjects")
      .select(
        "id, code, name, description, credits, department_id, semester_id",
      )
      .eq("semester_id", semester.id)
      .order("code");

    subjectIds =
      semesterSubjects?.map((subject) => subject.id) ?? [];
  }

  let subjects: Array<{
    id: string;
    code: string;
    name: string;
    description: string | null;
    credits: number | null;
    department_id: string;
    semester_id: string;
    progress: number;
    units: Array<{
      id: string;
      unit_number: number;
      title: string;
      description: string | null;
      progress: number;
      completed: boolean;
      topics: Array<{
        id: string;
        title: string;
        description: string | null;
        sequence_number: number;
      }>;
    }>;
  }> = [];

  if (subjectIds.length > 0) {
    const { data: subjectRows } = await supabase
      .from("subjects")
      .select(
        "id, code, name, description, credits, department_id, semester_id",
      )
      .in("id", subjectIds)
      .eq("semester_id", semester.id)
      .order("code");

    const { data: subjectProgressRows } = await supabase
      .from("student_subject_progress")
      .select(
        "subject_id, progress_percentage",
      )
      .eq("student_id", student.id)
      .in("subject_id", subjectIds);

    const { data: unitRows } = await supabase
      .from("syllabus_units")
      .select(
        "id, subject_id, unit_number, title, description",
      )
      .in("subject_id", subjectIds)
      .order("unit_number");

    const unitIds =
      unitRows?.map((unit) => unit.id) ?? [];

    const { data: topicRows } =
      unitIds.length > 0
        ? await supabase
            .from("syllabus_topics")
            .select(
              "id, unit_id, title, description, sequence_number",
            )
            .in("unit_id", unitIds)
            .order("sequence_number")
        : { data: [] };

    const { data: unitProgressRows } = await supabase
      .from("unit_progress")
      .select(
        "subject_id, unit_number, progress_percentage, completed",
      )
      .eq("student_id", student.id)
      .in("subject_id", subjectIds);

    const progressMap = new Map(
      (subjectProgressRows ?? []).map((row) => [
        row.subject_id,
        Number(row.progress_percentage),
      ]),
    );

    const unitProgressMap = new Map(
      (unitProgressRows ?? []).map((row) => [
        `${row.subject_id}:${row.unit_number}`,
        {
          progress: Number(row.progress_percentage),
          completed: row.completed,
        },
      ]),
    );

    const topicsByUnit = new Map<
      string,
      typeof topicRows
    >();

    for (const topic of topicRows ?? []) {
      const existing =
        topicsByUnit.get(topic.unit_id) ?? [];

      existing.push(topic);
      topicsByUnit.set(topic.unit_id, existing);
    }

    subjects = (subjectRows ?? []).map((subject) => {
      const units = (unitRows ?? [])
        .filter(
          (unit) => unit.subject_id === subject.id,
        )
        .map((unit) => {
          const progress =
            unitProgressMap.get(
              `${subject.id}:${unit.unit_number}`,
            );

          return {
            id: unit.id,
            unit_number: unit.unit_number,
            title: unit.title,
            description: unit.description,
            progress: progress?.progress ?? 0,
            completed: progress?.completed ?? false,
            topics:
              topicsByUnit.get(unit.id) ?? [],
          };
        });

      let progress =
        progressMap.get(subject.id) ?? 0;

      /*
       * If unit progress exists, use it as the more
       * detailed source of truth for display.
       */
      if (units.length > 0) {
        progress =
          units.reduce(
            (sum, unit) => sum + unit.progress,
            0,
          ) / units.length;
      }

      return {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        description: subject.description,
        credits:
          subject.credits === null
            ? null
            : Number(subject.credits),
        department_id: subject.department_id,
        semester_id: subject.semester_id,
        progress: Math.round(progress),
        units,
      };
    });
  }

  const totalCredits = subjects.reduce(
    (sum, subject) =>
      sum + (subject.credits ?? 0),
    0,
  );

  const overallProgress =
    subjects.length > 0
      ? Math.round(
          subjects.reduce(
            (sum, subject) =>
              sum + subject.progress,
            0,
          ) / subjects.length,
        )
      : 0;

  const completedSubjects = subjects.filter(
    (subject) => subject.progress >= 100,
  ).length;

  return {
    student,
    program,
    department,
    semester,
    subjects,
    totalCredits,
    overallProgress,
    completedSubjects,
    usingStudentSubjectMapping:
      (studentSubjects?.length ?? 0) > 0,
  };
}