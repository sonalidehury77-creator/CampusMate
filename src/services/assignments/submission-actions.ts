"use server";

import { revalidatePath } from "next/cache";

import { requireFaculty } from "@/lib/auth/require-faculty";
import { createClient } from "@/lib/supabase/server";

/* ============================================================
   HELPERS
============================================================ */

function getText(
  formData: FormData,
  name: string,
): string {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getNumber(
  formData: FormData,
  name: string,
): number | null {
  const value = getText(formData, name);

  if (!value) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

/* ============================================================
   GET CURRENT STUDENT
============================================================ */

async function getStudent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { data: student, error } = await supabase
    .from("students")
    .select("id, profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load student: ${error.message}`,
    );
  }

  if (!student) {
    throw new Error("Student record not found.");
  }

  return {
    id: student.id,
    profileId: student.profile_id,
  };
}

/* ============================================================
   SUBMIT ASSIGNMENT
============================================================ */

export async function submitAssignment(
  formData: FormData,
) {
  const student = await getStudent();

  const supabase = await createClient();

  const assignmentId = getText(
    formData,
    "assignment_id",
  );

  const submissionText = getText(
    formData,
    "submission_text",
  );

  const attachmentPath =
    getText(
      formData,
      "attachment_path",
    ) || null;

  if (!assignmentId) {
    throw new Error("Assignment ID is required.");
  }

  if (!submissionText && !attachmentPath) {
    throw new Error(
      "Write a submission or attach a file.",
    );
  }

  /* ----------------------------------------------------------
     LOAD ASSIGNMENT
  ---------------------------------------------------------- */

  const {
    data: assignment,
    error: assignmentError,
  } = await supabase
    .from("assignments")
    .select(
      `
        id,
        subject_id,
        due_date
      `,
    )
    .eq("id", assignmentId)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(
      `Failed to load assignment: ${assignmentError.message}`,
    );
  }

  if (!assignment) {
    throw new Error("Assignment not found.");
  }

  /* ----------------------------------------------------------
     VERIFY STUDENT ENROLLMENT
  ---------------------------------------------------------- */

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("student_subjects")
    .select("id")
    .eq("student_id", student.id)
    .eq("subject_id", assignment.subject_id)
    .maybeSingle();

  if (enrollmentError) {
    throw new Error(
      `Failed to verify subject enrollment: ${enrollmentError.message}`,
    );
  }

  if (!enrollment) {
    throw new Error(
      "You are not enrolled in this assignment's subject.",
    );
  }

  /* ----------------------------------------------------------
     CHECK EXISTING SUBMISSION
  ---------------------------------------------------------- */

  const {
    data: existingSubmission,
    error: existingError,
  } = await supabase
    .from("assignment_submissions")
    .select(
      `
        id,
        status
      `,
    )
    .eq("assignment_id", assignmentId)
    .eq("student_id", student.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `Failed to check previous submission: ${existingError.message}`,
    );
  }

  if (existingSubmission) {
    throw new Error(
      "You have already submitted this assignment.",
    );
  }

  /* ----------------------------------------------------------
     DETERMINE STATUS
  ---------------------------------------------------------- */

  const now = new Date();

  const dueDate = assignment.due_date
    ? new Date(assignment.due_date)
    : null;

  const status =
    dueDate &&
    now.getTime() > dueDate.getTime()
      ? "late"
      : "submitted";

  /* ----------------------------------------------------------
     INSERT SUBMISSION
  ---------------------------------------------------------- */

  const { error: insertError } = await supabase
    .from("assignment_submissions")
    .insert({
      assignment_id: assignmentId,
      student_id: student.id,
      status,
      submission_text:
        submissionText || null,
      attachment_path: attachmentPath,
      submitted_at: now.toISOString(),
    });

  if (insertError) {
    throw new Error(
      `Failed to submit assignment: ${insertError.message}`,
    );
  }

  /* ----------------------------------------------------------
     REFRESH PAGES
  ---------------------------------------------------------- */

  revalidatePath("/assignments");

  revalidatePath(
    `/assignments/${assignmentId}`,
  );
}

/* ============================================================
   GRADE ASSIGNMENT SUBMISSION
============================================================ */

export async function gradeAssignmentSubmission(
  formData: FormData,
) {
  const { profile } = await requireFaculty();

  const supabase = await createClient();

  const submissionId = getText(
    formData,
    "submission_id",
  );

  const marks = getNumber(
    formData,
    "marks",
  );

  const maxMarks = getNumber(
    formData,
    "max_marks",
  );

  const feedback =
    getText(
      formData,
      "feedback",
    ) || null;

  if (!submissionId) {
    throw new Error(
      "Submission ID is required.",
    );
  }

  if (
    marks === null ||
    maxMarks === null
  ) {
    throw new Error(
      "Marks and maximum marks are required.",
    );
  }

  if (maxMarks <= 0) {
    throw new Error(
      "Maximum marks must be greater than zero.",
    );
  }

  if (marks < 0) {
    throw new Error(
      "Marks cannot be negative.",
    );
  }

  if (marks > maxMarks) {
    throw new Error(
      "Marks cannot be greater than maximum marks.",
    );
  }

  /* ----------------------------------------------------------
     LOAD SUBMISSION + ASSIGNMENT
  ---------------------------------------------------------- */

  const {
    data: submission,
    error: submissionError,
  } = await supabase
    .from("assignment_submissions")
    .select(
      `
        id,
        assignment_id,
        assignments (
          id,
          faculty_id
        )
      `,
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError) {
    throw new Error(
      `Failed to load submission: ${submissionError.message}`,
    );
  }

  if (!submission) {
    throw new Error(
      "Submission not found.",
    );
  }

  /* ----------------------------------------------------------
     VERIFY FACULTY OWNERSHIP
  ---------------------------------------------------------- */

  const assignment = Array.isArray(
    submission.assignments,
  )
    ? submission.assignments[0]
    : submission.assignments;

  if (!assignment) {
    throw new Error(
      "Assignment linked to this submission was not found.",
    );
  }

  if (
    assignment.faculty_id !== profile.id
  ) {
    throw new Error(
      "You are not authorized to grade this submission.",
    );
  }

  /* ----------------------------------------------------------
     UPDATE GRADE
  ---------------------------------------------------------- */

  const {
    error: updateError,
  } = await supabase
    .from("assignment_submissions")
    .update({
      marks,
      max_marks: maxMarks,
      feedback,
      status: "graded",
      graded_by: profile.id,
      graded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (updateError) {
    throw new Error(
      `Failed to save grade: ${updateError.message}`,
    );
  }

  /* ----------------------------------------------------------
     REFRESH FACULTY PAGES
  ---------------------------------------------------------- */

  revalidatePath(
    "/faculty/assignments",
  );

  revalidatePath(
    `/faculty/assignments/${submission.assignment_id}`,
  );
}