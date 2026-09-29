import { createClient } from "@/lib/supabase/server";


type FacultyContext = {
  facultyId: string;
  profileId: string;
  name: string;
  employeeNumber: string;
  designation: string;
  departmentId: string;
};


async function getFacultyContext(): Promise<FacultyContext> {
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
      "Authentication required.",
    );
  }


  const {
    data: faculty,
    error,
  } =
    await supabase
      .from("faculty")
      .select(`
        id,
        profile_id,
        employee_number,
        designation,
        department_id
      `)
      .eq(
        "profile_id",
        user.id,
      )
      .maybeSingle();


  if (error) {
    throw new Error(
      `Failed to load faculty record: ${error.message}`,
    );
  }


  if (!faculty) {
    throw new Error(
      "Faculty record not found.",
    );
  }


  const {
    data: profile,
    error: profileError,
  } =
    await supabase
      .from("profiles")
      .select("full_name")
      .eq(
        "id",
        user.id,
      )
      .maybeSingle();


  if (profileError) {
    throw new Error(
      `Failed to load faculty profile: ${profileError.message}`,
    );
  }


  return {
    facultyId:
      faculty.id,

    profileId:
      faculty.profile_id,

    name:
      profile?.full_name ??
      "Faculty",

    employeeNumber:
      faculty.employee_number,

    designation:
      faculty.designation ??
      "Faculty",

    departmentId:
      faculty.department_id,
  };
}


/* ============================================================
   FACULTY SUBJECTS
   ============================================================ */

export async function getFacultySubjects() {
  const supabase =
    await createClient();

  const faculty =
    await getFacultyContext();


  const {
    data: assignments,
    error,
  } =
    await supabase
      .from("faculty_subjects")
      .select(`
        id,
        subject_id,
        academic_year
      `)
      .eq(
        "faculty_id",
        faculty.facultyId,
      );


  if (error) {
    throw new Error(
      `Failed to load faculty subjects: ${error.message}`,
    );
  }


  const subjectIds =
    [
      ...new Set(
        (assignments ?? []).map(
          (item) =>
            item.subject_id,
        ),
      ),
    ];


  if (
    subjectIds.length ===
    0
  ) {
    return [];
  }


  const {
    data: subjects,
    error: subjectError,
  } =
    await supabase
      .from("subjects")
      .select(`
        id,
        name,
        code,
        semester_id
      `)
      .in(
        "id",
        subjectIds,
      );


  if (subjectError) {
    throw new Error(
      `Failed to load subjects: ${subjectError.message}`,
    );
  }


  return (
    subjects ?? []
  ).map(
    (subject) => {

      const assignment =
        assignments?.find(
          (item) =>
            item.subject_id ===
            subject.id,
        );


      return {
        id:
          subject.id,

        name:
          subject.name,

        code:
          subject.code,

        semesterId:
          subject.semester_id,

        academicYear:
          assignment?.academic_year ??
          "—",
      };
    },
  );
}


/* ============================================================
   FACULTY STUDENTS
   ============================================================ */

export async function getFacultyStudents() {
  const supabase =
    await createClient();

  const faculty =
    await getFacultyContext();


  const {
    data: facultySubjects,
    error: facultySubjectError,
  } =
    await supabase
      .from("faculty_subjects")
      .select("subject_id")
      .eq(
        "faculty_id",
        faculty.facultyId,
      );


  if (facultySubjectError) {
    throw new Error(
      `Failed to load teaching subjects: ${facultySubjectError.message}`,
    );
  }


  const subjectIds =
    [
      ...new Set(
        (
          facultySubjects ??
          []
        ).map(
          (item) =>
            item.subject_id,
        ),
      ),
    ];


  if (
    subjectIds.length ===
    0
  ) {
    return [];
  }


  const {
    data: enrollments,
    error: enrollmentError,
  } =
    await supabase
      .from("student_subjects")
      .select(`
        student_id,
        subject_id
      `)
      .in(
        "subject_id",
        subjectIds,
      );


  if (enrollmentError) {
    throw new Error(
      `Failed to load student enrollments: ${enrollmentError.message}`,
    );
  }


  const studentIds =
    [
      ...new Set(
        (
          enrollments ??
          []
        ).map(
          (item) =>
            item.student_id,
        ),
      ),
    ];


  if (
    studentIds.length ===
    0
  ) {
    return [];
  }


  const {
    data: students,
    error: studentError,
  } =
    await supabase
      .from("students")
      .select(`
        id,
        profile_id,
        student_number,
        current_semester,
        enrollment_year
      `)
      .in(
        "id",
        studentIds,
      );


  if (studentError) {
    throw new Error(
      `Failed to load students: ${studentError.message}`,
    );
  }


  const profileIds =
    [
      ...new Set(
        (
          students ??
          []
        ).map(
          (student) =>
            student.profile_id,
        ),
      ),
    ];


  if (
    profileIds.length ===
    0
  ) {
    return [];
  }


  const {
    data: profiles,
    error: profileError,
  } =
    await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email
      `)
      .in(
        "id",
        profileIds,
      );


  if (profileError) {
    throw new Error(
      `Failed to load student profiles: ${profileError.message}`,
    );
  }


  const profileMap =
    new Map(
      (
        profiles ??
        []
      ).map(
        (profile) => [
          profile.id,
          profile,
        ],
      ),
    );


  return (
    students ?? []
  ).map(
    (student) => {

      const profile =
        profileMap.get(
          student.profile_id,
        );


      return {
        id:
          student.id,

        profileId:
          student.profile_id,

        name:
          profile?.full_name ??
          "Student",

        email:
          profile?.email ??
          "",

        studentNumber:
          student.student_number,

        semester:
          student.current_semester,

        enrollmentYear:
          student.enrollment_year,

        subjects:
          (
            enrollments ??
            []
          )
            .filter(
              (item) =>
                item.student_id ===
                student.id,
            )
            .map(
              (item) =>
                item.subject_id,
            ),
      };
    },
  );
}


/* ============================================================
   FACULTY ASSIGNMENTS
   ============================================================ */

export async function getFacultyAssignments() {
  const supabase =
    await createClient();

  const faculty =
    await getFacultyContext();


  const {
    data: assignments,
    error,
  } =
    await supabase
      .from("assignments")
      .select(`
        id,
        subject_id,
        title,
        description,
        due_date,
        priority,
        attachment_url,
        created_at,
        updated_at
      `)
      .eq(
        "faculty_id",
        faculty.facultyId,
      )
      .order(
        "due_date",
        {
          ascending:
            true,

          nullsFirst:
            false,
        },
      );


  if (error) {
    throw new Error(
      `Failed to load assignments: ${error.message}`,
    );
  }


  const subjectIds =
    [
      ...new Set(
        (
          assignments ??
          []
        ).map(
          (item) =>
            item.subject_id,
        ),
      ),
    ];


  let subjects: {
    id: string;
    name: string;
    code: string;
  }[] = [];


  if (
    subjectIds.length >
    0
  ) {
    const {
      data,
      error: subjectError,
    } =
      await supabase
        .from("subjects")
        .select(
          "id, name, code",
        )
        .in(
          "id",
          subjectIds,
        );


    if (subjectError) {
      throw new Error(
        `Failed to load assignment subjects: ${subjectError.message}`,
      );
    }


    subjects =
      data ?? [];
  }


  const subjectMap =
    new Map(
      subjects.map(
        (subject) => [
          subject.id,
          subject,
        ],
      ),
    );


  const assignmentIds =
    (
      assignments ??
      []
    ).map(
      (item) =>
        item.id,
    );


  let submissions: {
    id: string;
    assignment_id: string;
    student_id: string;
    status: string;
    marks: number | null;
    submitted_at: string | null;
  }[] = [];


  if (
    assignmentIds.length >
    0
  ) {
    const {
      data,
      error: submissionError,
    } =
      await supabase
        .from(
          "assignment_submissions",
        )
        .select(`
          id,
          assignment_id,
          student_id,
          status,
          marks,
          submitted_at
        `)
        .in(
          "assignment_id",
          assignmentIds,
        );


    if (submissionError) {
      throw new Error(
        `Failed to load submissions: ${submissionError.message}`,
      );
    }


    submissions =
      data ?? [];
  }


  return (
    assignments ??
    []
  ).map(
    (assignment) => {

      const subject =
        subjectMap.get(
          assignment.subject_id,
        );


      const assignmentSubmissions =
        submissions.filter(
          (submission) =>
            submission.assignment_id ===
            assignment.id,
        );


      return {
        ...assignment,

        subjectName:
          subject?.name ??
          "Unknown subject",

        subjectCode:
          subject?.code ??
          "",

        submissionCount:
          assignmentSubmissions.length,

        gradedCount:
          assignmentSubmissions.filter(
            (item) =>
              item.status ===
              "graded",
          ).length,

        pendingCount:
          assignmentSubmissions.filter(
            (item) =>
              item.status !==
              "graded",
          ).length,
      };
    },
  );
}


/* ============================================================
   FACULTY TIMETABLE
   ============================================================ */

export async function getFacultyTimetable() {
  const supabase =
    await createClient();

  const faculty =
    await getFacultyContext();


  const {
    data,
    error,
  } =
    await supabase
      .from("timetable_entries")
      .select(`
        id,
        subject_id,
        semester_id,
        day_of_week,
        start_time,
        end_time,
        room,
        schedule_type
      `)
      .eq(
        "faculty_id",
        faculty.facultyId,
      )
      .order(
        "day_of_week",
      )
      .order(
        "start_time",
      );


  if (error) {
    throw new Error(
      `Failed to load timetable: ${error.message}`,
    );
  }


  const subjectIds =
    [
      ...new Set(
        (
          data ??
          []
        ).map(
          (item) =>
            item.subject_id,
        ),
      ),
    ];


  let subjects: {
    id: string;
    name: string;
    code: string;
  }[] = [];


  if (
    subjectIds.length >
    0
  ) {
    const {
      data: subjectData,
      error: subjectError,
    } =
      await supabase
        .from("subjects")
        .select(
          "id, name, code",
        )
        .in(
          "id",
          subjectIds,
        );


    if (subjectError) {
      throw new Error(
        `Failed to load timetable subjects: ${subjectError.message}`,
      );
    }


    subjects =
      subjectData ??
      [];
  }


  const subjectMap =
    new Map(
      subjects.map(
        (subject) => [
          subject.id,
          subject,
        ],
      ),
    );


  return (
    data ?? []
  ).map(
    (entry) => {

      const subject =
        subjectMap.get(
          entry.subject_id,
        );


      return {
        ...entry,

        subjectName:
          subject?.name ??
          "Unknown",

        subjectCode:
          subject?.code ??
          "",
      };
    },
  );
}


/* ============================================================
   FACULTY DASHBOARD
   ============================================================ */

export async function getFacultyDashboardData() {
  const [
    subjects,
    students,
    assignments,
    timetable,
  ] =
    await Promise.all([
      getFacultySubjects(),

      getFacultyStudents(),

      getFacultyAssignments(),

      getFacultyTimetable(),
    ]);


  const today =
    new Date();


  const dayOfWeek =
    today.getDay();


  const todayClasses =
    timetable.filter(
      (entry) =>
        entry.day_of_week ===
        dayOfWeek,
    );


  const pendingSubmissions =
    assignments.reduce(
      (
        total,
        assignment,
      ) =>
        total +
        assignment.pendingCount,
      0,
    );


  return {
    subjects,

    students,

    assignments,

    timetable,

    todayClasses,

    pendingSubmissions,
  };
}