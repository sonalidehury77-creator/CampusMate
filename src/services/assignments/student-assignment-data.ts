import { createClient } from "@/lib/supabase/server";

/* ============================================================
   GET ALL ASSIGNMENTS FOR CURRENT STUDENT
============================================================ */

export async function getStudentAssignments() {
  const supabase = await createClient();

  // ------------------------------------------------------------
  // 1. Get logged-in user
  // ------------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  // ------------------------------------------------------------
  // 2. Get student record
  // ------------------------------------------------------------

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (studentError) {
    throw new Error(
      `Failed to load student: ${studentError.message}`,
    );
  }

  if (!student) {
    throw new Error("Student profile not found.");
  }

  // ------------------------------------------------------------
  // 3. Get student's subjects
  // ------------------------------------------------------------

  const { data: enrollments, error: enrollmentError } =
    await supabase
      .from("student_subjects")
      .select("subject_id")
      .eq("student_id", student.id);

  if (enrollmentError) {
    throw new Error(
      `Failed to load subjects: ${enrollmentError.message}`,
    );
  }

  const subjectIds = (enrollments ?? [])
    .map((enrollment) => enrollment.subject_id)
    .filter(
      (subjectId): subjectId is string => Boolean(subjectId),
    );

  if (subjectIds.length === 0) {
    return [];
  }

  // ------------------------------------------------------------
  // 4. Get assignments
  //
  // IMPORTANT:
  // max_marks does NOT belong to assignments.
  // It belongs to assignment_submissions.
  // ------------------------------------------------------------

  const { data: assignments, error: assignmentError } =
    await supabase
      .from("assignments")
      .select(
        `
          id,
          subject_id,
          title,
          description,
          due_date,
          priority,
          attachment_url,
          created_at
        `,
      )
      .in("subject_id", subjectIds)
      .order("due_date", {
        ascending: true,
        nullsFirst: false,
      });

  if (assignmentError) {
    throw new Error(
      `Failed to load assignments: ${assignmentError.message}`,
    );
  }

  const assignmentList = assignments ?? [];

  if (assignmentList.length === 0) {
    return [];
  }

  // ------------------------------------------------------------
  // 5. Get subjects
  // ------------------------------------------------------------

  const { data: subjects, error: subjectError } = await supabase
    .from("subjects")
    .select(
      `
        id,
        code,
        name
      `,
    )
    .in("id", subjectIds);

  if (subjectError) {
    throw new Error(
      `Failed to load subjects: ${subjectError.message}`,
    );
  }

  // ------------------------------------------------------------
  // 6. Get assignment IDs
  // ------------------------------------------------------------

  const assignmentIds = assignmentList.map(
    (assignment) => assignment.id,
  );

  // ------------------------------------------------------------
  // 7. Get current student's submissions
  // ------------------------------------------------------------

  const { data: submissions, error: submissionError } =
    await supabase
      .from("assignment_submissions")
      .select(
        `
          id,
          assignment_id,
          status,
          submitted_at,
          marks,
          max_marks,
          feedback,
          attachment_path
        `,
      )
      .eq("student_id", student.id)
      .in("assignment_id", assignmentIds);

  if (submissionError) {
    throw new Error(
      `Failed to load submissions: ${submissionError.message}`,
    );
  }

  // ------------------------------------------------------------
  // 8. Create subject map
  // ------------------------------------------------------------

  const subjectMap = new Map<
    string,
    {
      id: string;
      code: string;
      name: string;
    }
  >();

  for (const subject of subjects ?? []) {
    subjectMap.set(subject.id, subject);
  }

  // ------------------------------------------------------------
  // 9. Create submission map
  // ------------------------------------------------------------

  const submissionMap = new Map<
    string,
    {
      id: string;
      assignment_id: string;
      status: string;
      submitted_at: string | null;
      marks: number | null;
      max_marks: number | null;
      feedback: string | null;
      attachment_path: string | null;
    }
  >();

  for (const submission of submissions ?? []) {
    submissionMap.set(submission.assignment_id, submission);
  }

  // ------------------------------------------------------------
  // 10. Return final assignment data
  // ------------------------------------------------------------

  return assignmentList.map((assignment) => {
    const subject =
      subjectMap.get(assignment.subject_id) ?? null;

    const submission =
      submissionMap.get(assignment.id) ?? null;

    return {
      id: assignment.id,

      subject_id: assignment.subject_id,

      title: assignment.title,

      description: assignment.description,

      due_date: assignment.due_date,

      priority: assignment.priority,

      attachment_url: assignment.attachment_url,

      /*
       * max_marks belongs to the student's submission,
       * not to the assignment itself.
       *
       * We expose it here only for UI compatibility.
       */
      max_marks: submission?.max_marks ?? null,

      created_at: assignment.created_at,

      subject,

      submission,
    };
  });
}

/* ============================================================
   GET ONE ASSIGNMENT FOR CURRENT STUDENT
============================================================ */

export async function getStudentAssignment(
  assignmentId: string,
) {
  const supabase = await createClient();

  // ------------------------------------------------------------
  // 1. Get logged-in user
  // ------------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  // ------------------------------------------------------------
  // 2. Get student
  // ------------------------------------------------------------

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (studentError) {
    throw new Error(
      `Failed to load student: ${studentError.message}`,
    );
  }

  if (!student) {
    throw new Error("Student profile not found.");
  }

  // ------------------------------------------------------------
  // 3. Load assignment
  //
  // IMPORTANT:
  // max_marks is NOT selected here because it is not a column
  // of the assignments table.
  // ------------------------------------------------------------

  const { data: assignment, error: assignmentError } =
    await supabase
      .from("assignments")
      .select(
        `
          id,
          subject_id,
          title,
          description,
          due_date,
          priority,
          attachment_url,
          created_at
        `,
      )
      .eq("id", assignmentId)
      .maybeSingle();

  if (assignmentError) {
    throw new Error(
      `Unable to load assignment: ${assignmentError.message}`,
    );
  }

  if (!assignment) {
    return null;
  }

  // ------------------------------------------------------------
  // 4. Verify student enrollment
  // ------------------------------------------------------------

  const { data: enrollment, error: enrollmentError } =
    await supabase
      .from("student_subjects")
      .select("id")
      .eq("student_id", student.id)
      .eq("subject_id", assignment.subject_id)
      .maybeSingle();

  if (enrollmentError) {
    throw new Error(
      `Failed to verify enrollment: ${enrollmentError.message}`,
    );
  }

  if (!enrollment) {
    return null;
  }

  // ------------------------------------------------------------
  // 5. Load subject
  // ------------------------------------------------------------

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select(
      `
        id,
        code,
        name
      `,
    )
    .eq("id", assignment.subject_id)
    .maybeSingle();

  if (subjectError) {
    throw new Error(
      `Failed to load subject: ${subjectError.message}`,
    );
  }

  // ------------------------------------------------------------
  // 6. Load student's own submission
  // ------------------------------------------------------------

  const { data: submission, error: submissionError } =
    await supabase
      .from("assignment_submissions")
      .select(
        `
          id,
          status,
          submission_text,
          attachment_path,
          submitted_at,
          marks,
          max_marks,
          feedback,
          graded_at
        `,
      )
      .eq("assignment_id", assignmentId)
      .eq("student_id", student.id)
      .maybeSingle();

  if (submissionError) {
    throw new Error(
      `Failed to load submission: ${submissionError.message}`,
    );
  }

  // ------------------------------------------------------------
  // 7. Return final result
  // ------------------------------------------------------------

  return {
    assignment: {
      id: assignment.id,

      subject_id: assignment.subject_id,

      title: assignment.title,

      description: assignment.description,

      due_date: assignment.due_date,

      priority: assignment.priority,

      attachment_url: assignment.attachment_url,

      /*
       * max_marks is taken from the submission.
       * It is null until a submission/grade exists.
       */
      max_marks: submission?.max_marks ?? null,

      created_at: assignment.created_at,
    },

    subject,

    submission,
  };
}