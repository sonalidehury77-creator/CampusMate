"use server";

import { revalidatePath } from "next/cache";

import { requireFaculty } from "@/lib/auth/require-faculty";
import { createClient } from "@/lib/supabase/server";

/* ============================================================
   FORM HELPERS
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

function getOptionalText(
  formData: FormData,
  name: string,
): string | null {
  const value = getText(formData, name);

  return value.length > 0 ? value : null;
}

function getOptionalNumber(
  formData: FormData,
  name: string,
): number | null {
  const value = getText(formData, name);

  if (!value) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

/* ============================================================
   GET CURRENT FACULTY RECORD
============================================================ */

async function getCurrentFacultyId() {
  const { profile } = await requireFaculty();
  const supabase = await createClient();

  const { data: faculty, error } = await supabase
    .from("faculty")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load faculty record: ${error.message}`,
    );
  }

  if (!faculty) {
    throw new Error("Faculty record not found.");
  }

  return {
    profile,
    facultyId: faculty.id,
    supabase,
  };
}

/* ============================================================
   CREATE ASSIGNMENT
============================================================ */

export async function createFacultyAssignment(
  formData: FormData,
) {
  const { profile } = await requireFaculty();
  const supabase = await createClient();

  const subjectId = getText(formData, "subject_id");
  const title = getText(formData, "title");

  const description = getOptionalText(
    formData,
    "description",
  );

  const dueDate = getOptionalText(
    formData,
    "due_date",
  );

  const priority =
    getText(formData, "priority") || "normal";

  if (!subjectId) {
    throw new Error("Subject is required.");
  }

  if (!title) {
    throw new Error("Assignment title is required.");
  }

  if (!["low", "normal", "high"].includes(priority)) {
    throw new Error("Invalid assignment priority.");
  }

  const {
    data: faculty,
    error: facultyError,
  } = await supabase
    .from("faculty")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (facultyError) {
    throw new Error(
      `Failed to load faculty: ${facultyError.message}`,
    );
  }

  const {
    data: facultySubject,
    error: subjectError,
  } = await supabase
    .from("faculty_subjects")
    .select("id")
    .eq("faculty_id", faculty.id)
    .eq("subject_id", subjectId)
    .maybeSingle();

  if (subjectError) {
    throw new Error(
      `Failed to verify subject access: ${subjectError.message}`,
    );
  }

  if (!facultySubject) {
    throw new Error(
      "You are not assigned to this subject.",
    );
  }

  const { error } = await supabase
    .from("assignments")
    .insert({
      subject_id: subjectId,
      faculty_id: faculty.id,
      title,
      description,
      due_date: dueDate
        ? new Date(dueDate).toISOString()
        : null,
      priority,
    });

  if (error) {
    throw new Error(
      `Failed to create assignment: ${error.message}`,
    );
  }

  revalidatePath("/faculty");
  revalidatePath("/faculty/assignments");
  revalidatePath("/assignments");
}

/* ============================================================
   UPDATE ASSIGNMENT
============================================================ */

export async function updateFacultyAssignment(
  formData: FormData,
) {
  const { profile } = await requireFaculty();
  const supabase = await createClient();

  const assignmentId = getText(
    formData,
    "assignment_id",
  );

  const title = getText(formData, "title");

  const description = getOptionalText(
    formData,
    "description",
  );

  const dueDate = getOptionalText(
    formData,
    "due_date",
  );

  const priority =
    getText(formData, "priority") || "normal";

  if (!assignmentId) {
    throw new Error("Assignment ID is required.");
  }

  if (!title) {
    throw new Error("Assignment title is required.");
  }

  if (!["low", "normal", "high"].includes(priority)) {
    throw new Error("Invalid assignment priority.");
  }

  const {
    data: faculty,
    error: facultyError,
  } = await supabase
    .from("faculty")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (facultyError) {
    throw new Error(
      `Failed to load faculty: ${facultyError.message}`,
    );
  }

  const {
    data: assignment,
    error: assignmentError,
  } = await supabase
    .from("assignments")
    .select("id, faculty_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(
      `Failed to load assignment: ${assignmentError.message}`,
    );
  }

  if (
    !assignment ||
    assignment.faculty_id !== faculty.id
  ) {
    throw new Error(
      "You cannot modify this assignment.",
    );
  }

  const { error } = await supabase
    .from("assignments")
    .update({
      title,
      description,
      due_date: dueDate
        ? new Date(dueDate).toISOString()
        : null,
      priority,
    })
    .eq("id", assignmentId);

  if (error) {
    throw new Error(
      `Failed to update assignment: ${error.message}`,
    );
  }

  revalidatePath("/faculty/assignments");
  revalidatePath(
    `/faculty/assignments/${assignmentId}`,
  );
  revalidatePath("/assignments");
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

  const marks = getOptionalNumber(
    formData,
    "marks",
  );

  const maxMarks = getOptionalNumber(
    formData,
    "max_marks",
  );

  const feedback = getOptionalText(
    formData,
    "feedback",
  );

  if (!submissionId) {
    throw new Error("Submission ID is required.");
  }

  if (marks !== null && marks < 0) {
    throw new Error("Marks cannot be negative.");
  }

  if (maxMarks !== null && maxMarks <= 0) {
    throw new Error(
      "Maximum marks must be greater than zero.",
    );
  }

  if (
    marks !== null &&
    maxMarks !== null &&
    marks > maxMarks
  ) {
    throw new Error(
      "Marks cannot exceed maximum marks.",
    );
  }

  const {
    data: submission,
    error: submissionError,
  } = await supabase
    .from("assignment_submissions")
    .select(
      `
        id,
        assignment_id,
        student_id
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
    throw new Error("Submission not found.");
  }

  const {
    data: assignment,
    error: assignmentError,
  } = await supabase
    .from("assignments")
    .select("id, faculty_id")
    .eq("id", submission.assignment_id)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(
      `Failed to verify assignment: ${assignmentError.message}`,
    );
  }

  const {
    data: faculty,
    error: facultyError,
  } = await supabase
    .from("faculty")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (facultyError) {
    throw new Error(
      `Failed to load faculty: ${facultyError.message}`,
    );
  }

  if (
    !assignment ||
    assignment.faculty_id !== faculty.id
  ) {
    throw new Error(
      "You cannot grade this submission.",
    );
  }

  const { error } = await supabase
    .from("assignment_submissions")
    .update({
      status: "graded",
      marks,
      max_marks: maxMarks,
      feedback,
      graded_by: profile.id,
      graded_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) {
    throw new Error(
      `Failed to grade submission: ${error.message}`,
    );
  }

  revalidatePath(
    `/faculty/assignments/${submission.assignment_id}`,
  );

  revalidatePath("/faculty/assignments");
  revalidatePath("/assignments");
}

/* ============================================================
   CREATE ATTENDANCE SESSION
============================================================ */

export async function createAttendanceSession(
  formData: FormData,
) {
  const {
    facultyId,
    supabase,
  } = await getCurrentFacultyId();

  const subjectId = getText(
    formData,
    "subject_id",
  );

  const sessionDate = getText(
    formData,
    "session_date",
  );

  if (!subjectId) {
    throw new Error("Subject is required.");
  }

  if (!sessionDate) {
    throw new Error(
      "Session date is required.",
    );
  }

  /*
   * faculty_subjects uses faculty.id,
   * NOT profiles.id.
   */
  const {
    data: facultySubject,
    error: subjectError,
  } = await supabase
    .from("faculty_subjects")
    .select("id")
    .eq("faculty_id", facultyId)
    .eq("subject_id", subjectId)
    .maybeSingle();

  if (subjectError) {
    throw new Error(
      `Failed to verify subject access: ${subjectError.message}`,
    );
  }

  if (!facultySubject) {
    throw new Error(
      "You are not assigned to this subject.",
    );
  }

  const {
    data: session,
    error,
  } = await supabase
    .from("attendance_sessions")
    .insert({
      faculty_id: facultyId,
      subject_id: subjectId,
      session_date: sessionDate,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(
      `Failed to create attendance session: ${error.message}`,
    );
  }

  revalidatePath("/faculty/attendance");

  return {
    success: true,
    sessionId: session.id,
  };
}

/* ============================================================
   MARK ATTENDANCE
============================================================ */

export async function markAttendance(
  formData: FormData,
) {
  const {
    facultyId,
    supabase,
  } = await getCurrentFacultyId();

  const sessionId = getText(
    formData,
    "session_id",
  );

  const studentId = getText(
    formData,
    "student_id",
  );

  const status = getText(
    formData,
    "status",
  );

  if (!sessionId) {
    throw new Error("Session is required.");
  }

  if (!studentId) {
    throw new Error("Student is required.");
  }

  if (!status) {
    throw new Error(
      "Attendance status is required.",
    );
  }

  const allowedStatuses = [
    "present",
    "absent",
    "late",
    "excused",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      "Invalid attendance status.",
    );
  }

  /*
   * The attendance session stores faculty.id.
   */
  const {
    data: session,
    error: sessionError,
  } = await supabase
    .from("attendance_sessions")
    .select(
      "id, faculty_id",
    )
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    throw new Error(
      `Failed to load attendance session: ${sessionError.message}`,
    );
  }

  if (!session) {
    throw new Error(
      "Attendance session not found.",
    );
  }

  if (session.faculty_id !== facultyId) {
    throw new Error(
      "You are not authorized to modify this attendance session.",
    );
  }

  /*
   * Verify that the student exists.
   */
  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .maybeSingle();

  if (studentError) {
    throw new Error(
      `Failed to verify student: ${studentError.message}`,
    );
  }

  if (!student) {
    throw new Error("Student not found.");
  }

  /*
   * Use the actual unique attendance relationship.
   */
  const {
    error,
  } = await supabase
    .from("attendance_records")
    .upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        status,
        marked_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          "session_id,student_id",
      },
    );

  if (error) {
    throw new Error(
      `Failed to mark attendance: ${error.message}`,
    );
  }

  revalidatePath("/faculty/attendance");
  revalidatePath("/attendance");

  return {
    success: true,
  };
}

/* ============================================================
   CORRECT ATTENDANCE
============================================================ */

export async function correctAttendance(
  formData: FormData,
) {
  const {
    facultyId,
    profile,
    supabase,
  } = await getCurrentFacultyId();

  const recordId = getText(
    formData,
    "record_id",
  );

  const newStatus = getText(
    formData,
    "new_status",
  );

  const reason = getText(
    formData,
    "reason",
  );

  if (!recordId) {
    throw new Error(
      "Attendance record is required.",
    );
  }

  if (!newStatus) {
    throw new Error(
      "New attendance status is required.",
    );
  }

  if (!reason) {
    throw new Error(
      "Correction reason is required.",
    );
  }

  const allowedStatuses = [
    "present",
    "absent",
    "late",
    "excused",
  ];

  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(
      "Invalid attendance status.",
    );
  }

  /*
   * Load the current record.
   */
  const {
    data: record,
    error: recordError,
  } = await supabase
    .from("attendance_records")
    .select(
      "id, session_id, status",
    )
    .eq("id", recordId)
    .maybeSingle();

  if (recordError) {
    throw new Error(
      `Failed to load attendance record: ${recordError.message}`,
    );
  }

  if (!record) {
    throw new Error(
      "Attendance record not found.",
    );
  }

  /*
   * Verify ownership through the attendance session.
   */
  const {
    data: session,
    error: sessionError,
  } = await supabase
    .from("attendance_sessions")
    .select(
      "id, faculty_id",
    )
    .eq("id", record.session_id)
    .maybeSingle();

  if (sessionError) {
    throw new Error(
      `Failed to verify attendance session: ${sessionError.message}`,
    );
  }

  if (!session) {
    throw new Error(
      "Attendance session not found.",
    );
  }

  if (session.faculty_id !== facultyId) {
    throw new Error(
      "You are not authorized to correct this attendance record.",
    );
  }

  /*
   * Do not create an unnecessary correction
   * if the status has not changed.
   */
  if (record.status === newStatus) {
    throw new Error(
      "The new status is the same as the current status.",
    );
  }

  /*
   * Store the audit history.
   *
   * attendance_corrections.corrected_by
   * references profiles.id.
   */
  const {
    error: correctionError,
  } = await supabase
    .from("attendance_corrections")
    .insert({
      attendance_record_id:
        record.id,
      old_status:
        record.status,
      new_status:
        newStatus,
      reason,
      corrected_by:
        profile.id,
      corrected_at:
        new Date().toISOString(),
    });

  if (correctionError) {
    throw new Error(
      `Failed to record attendance correction: ${correctionError.message}`,
    );
  }

  /*
   * Update the actual attendance record.
   */
  const {
    error: updateError,
  } = await supabase
    .from("attendance_records")
    .update({
      status: newStatus,
      marked_at:
        new Date().toISOString(),
    })
    .eq("id", record.id);

  if (updateError) {
    throw new Error(
      `Failed to correct attendance: ${updateError.message}`,
    );
  }

  revalidatePath("/faculty/attendance");
  revalidatePath("/attendance");

  return {
    success: true,
  };
}