import { createClient } from "@/lib/supabase/server";

export async function getAcademicData(userId: string) {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Unable to load your profile.");
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(
      "id, student_number, enrollment_year, current_semester, program_id, semester_id",
    )
    .eq("profile_id", userId)
    .single();

  if (studentError || !student) {
    throw new Error("Unable to load your student information.");
  }

  const { data: program } = await supabase
    .from("programs")
    .select("id, name, code, duration, department_id")
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
    .select("id, semester_number, academic_year")
    .eq("id", student.semester_id)
    .single();

  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("id, code, name, description, credits")
    .eq("semester_id", student.semester_id)
    .order("code");

  if (subjectsError) {
    throw new Error("Unable to load your subjects.");
  }

  const { data: enrolledSubjects } = await supabase
    .from("student_subjects")
    .select("subject_id, academic_year")
    .eq("student_id", student.id);

  const enrolledSubjectIds = new Set(
    (enrolledSubjects ?? []).map((item) => item.subject_id),
  );

  const { data: progressRows } = await supabase
    .from("student_subject_progress")
    .select("subject_id, progress_percentage")
    .eq("student_id", student.id);

  const progressMap = new Map(
    (progressRows ?? []).map((item) => [
      item.subject_id,
      Number(item.progress_percentage),
    ]),
  );

  const subjectList = (subjects ?? []).map((subject) => ({
    id: subject.id,
    code: subject.code,
    name: subject.name,
    description: subject.description,
    credits: subject.credits ? Number(subject.credits) : null,
    progress: progressMap.get(subject.id) ?? 0,
    isEnrolled:
      enrolledSubjectIds.size === 0 ||
      enrolledSubjectIds.has(subject.id),
  }));

  const visibleSubjects =
    enrolledSubjectIds.size > 0
      ? subjectList.filter((subject) => subject.isEnrolled)
      : subjectList;

  const totalCredits = visibleSubjects.reduce(
    (total, subject) => total + (subject.credits ?? 0),
    0,
  );

  const overallProgress =
    visibleSubjects.length > 0
      ? visibleSubjects.reduce(
          (total, subject) => total + subject.progress,
          0,
        ) / visibleSubjects.length
      : 0;

  const completedSubjects = visibleSubjects.filter(
    (subject) => subject.progress >= 100,
  ).length;

  const needsAttentionSubjects = visibleSubjects.filter(
    (subject) => subject.progress < 50,
  ).length;

  return {
    profile: {
      fullName: profile.full_name ?? "Student",
      email: profile.email,
      studentNumber: student.student_number,
      enrollmentYear: student.enrollment_year,
      currentSemester: student.current_semester,

      department: department
        ? {
            id: department.id,
            name: department.name,
            code: department.code,
          }
        : null,

      program: program
        ? {
            id: program.id,
            name: program.name,
            code: program.code,
            duration: program.duration,
          }
        : null,

      semester: semester
        ? {
            id: semester.id,
            semesterNumber: semester.semester_number,
            academicYear: semester.academic_year,
          }
        : null,
    },

    subjects: visibleSubjects,
    overallProgress,
    totalCredits,
    completedSubjects,
    needsAttentionSubjects,
  };
}

export async function getAcademicSubjectDetails(
  userId: string,
  subjectId: string,
) {
  const supabase = await createClient();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, semester_id")
    .eq("profile_id", userId)
    .single();

  if (studentError || !student) {
    throw new Error("Unable to load your student information.");
  }

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, code, name, description, credits, semester_id")
    .eq("id", subjectId)
    .eq("semester_id", student.semester_id)
    .single();

  if (subjectError || !subject) {
    throw new Error("Subject not found.");
  }

  const { data: progress } = await supabase
    .from("student_subject_progress")
    .select("progress_percentage")
    .eq("student_id", student.id)
    .eq("subject_id", subject.id)
    .maybeSingle();

  const { data: units, error: unitsError } = await supabase
    .from("syllabus_units")
    .select("id, unit_number, title, description")
    .eq("subject_id", subject.id)
    .order("unit_number");

  if (unitsError) {
    throw new Error("Unable to load the syllabus.");
  }

  const unitNumbers = (units ?? []).map(
    (unit) => unit.unit_number,
  );

  const { data: unitProgress } =
    unitNumbers.length > 0
      ? await supabase
          .from("unit_progress")
          .select(
            "unit_number, progress_percentage, completed",
          )
          .eq("student_id", student.id)
          .eq("subject_id", subject.id)
      : { data: [] };

  const unitProgressMap = new Map(
    (unitProgress ?? []).map((item) => [
      item.unit_number,
      {
        progress: Number(item.progress_percentage),
        completed: item.completed,
      },
    ]),
  );

  const unitIds = (units ?? []).map((unit) => unit.id);

  const { data: topics } =
    unitIds.length > 0
      ? await supabase
          .from("syllabus_topics")
          .select(
            "id, unit_id, title, description, sequence_number",
          )
          .in("unit_id", unitIds)
          .order("sequence_number")
      : { data: [] };

  const topicsByUnit = new Map<
    string,
    Array<{
      id: string;
      title: string;
      description: string | null;
      sequenceNumber: number;
    }>
  >();

  for (const topic of topics ?? []) {
    const existing = topicsByUnit.get(topic.unit_id) ?? [];

    existing.push({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      sequenceNumber: topic.sequence_number,
    });

    topicsByUnit.set(topic.unit_id, existing);
  }

  return {
    subject: {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      description: subject.description,
      credits: subject.credits
        ? Number(subject.credits)
        : null,

      progress: progress
        ? Number(progress.progress_percentage)
        : 0,

      isEnrolled: true,
    },

    units: (units ?? []).map((unit) => {
      const savedProgress = unitProgressMap.get(
        unit.unit_number,
      );

      return {
        id: unit.id,
        unitNumber: unit.unit_number,
        title: unit.title,
        description: unit.description,
        progress: savedProgress?.progress ?? 0,
        completed: savedProgress?.completed ?? false,
        topics: topicsByUnit.get(unit.id) ?? [],
      };
    }),
  };
}