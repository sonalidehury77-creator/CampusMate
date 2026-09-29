"use server";

import { revalidatePath } from "next/cache";

import { requireFaculty } from "@/lib/auth/require-faculty";
import { createClient } from "@/lib/supabase/server";


async function getFacultyId() {
  const {
    profile,
  } = await requireFaculty();

  const supabase =
    await createClient();

  const {
    data: faculty,
    error,
  } =
    await supabase
      .from("faculty")
      .select("id")
      .eq(
        "profile_id",
        profile.id,
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load faculty: ${error.message}`,
    );
  }

  if (!faculty) {
    throw new Error(
      "Faculty record not found.",
    );
  }

  return faculty.id;
}


/* ============================================================
   CREATE ASSIGNMENT
   ============================================================ */

export async function createFacultyAssignment(
  formData: FormData,
) {
  const supabase =
    await createClient();

  const facultyId =
    await getFacultyId();

  const subjectId =
    String(
      formData.get(
        "subject_id",
      ) ?? "",
    );

  const title =
    String(
      formData.get(
        "title",
      ) ?? "",
    ).trim();

  const description =
    String(
      formData.get(
        "description",
      ) ?? "",
    ).trim();

  const dueDate =
    String(
      formData.get(
        "due_date",
      ) ?? "",
    );

  const priority =
    String(
      formData.get(
        "priority",
      ) ?? "normal",
    );


  if (
    !subjectId ||
    !title
  ) {
    throw new Error(
      "Subject and assignment title are required.",
    );
  }


  const {
    data: teachingSubject,
    error: teachingError,
  } =
    await supabase
      .from("faculty_subjects")
      .select("id")
      .eq(
        "faculty_id",
        facultyId,
      )
      .eq(
        "subject_id",
        subjectId,
      )
      .maybeSingle();


  if (teachingError) {
    throw new Error(
      `Failed to verify teaching subject: ${teachingError.message}`,
    );
  }


  if (!teachingSubject) {
    throw new Error(
      "You are not assigned to this subject.",
    );
  }


  const {
    error,
  } =
    await supabase
      .from("assignments")
      .insert({
        faculty_id:
          facultyId,

        subject_id:
          subjectId,

        title,

        description:
          description ||
          null,

        due_date:
          dueDate ||
          null,

        priority,
      });


  if (error) {
    throw new Error(
      `Failed to create assignment: ${error.message}`,
    );
  }


  revalidatePath(
    "/faculty",
  );

  revalidatePath(
    "/faculty/assignments",
  );
}


/* ============================================================
   UPDATE ASSIGNMENT
   ============================================================ */

export async function updateFacultyAssignment(
  formData: FormData,
) {
  const supabase =
    await createClient();

  const facultyId =
    await getFacultyId();

  const assignmentId =
    String(
      formData.get(
        "assignment_id",
      ) ?? "",
    );

  const subjectId =
    String(
      formData.get(
        "subject_id",
      ) ?? "",
    );

  const title =
    String(
      formData.get(
        "title",
      ) ?? "",
    ).trim();

  const description =
    String(
      formData.get(
        "description",
      ) ?? "",
    ).trim();

  const dueDate =
    String(
      formData.get(
        "due_date",
      ) ?? "",
    );

  const priority =
    String(
      formData.get(
        "priority",
      ) ?? "normal",
    );


  if (
    !assignmentId ||
    !subjectId ||
    !title
  ) {
    throw new Error(
      "Assignment, subject and title are required.",
    );
  }


  const {
    data: teachingSubject,
    error: teachingError,
  } =
    await supabase
      .from("faculty_subjects")
      .select("id")
      .eq(
        "faculty_id",
        facultyId,
      )
      .eq(
        "subject_id",
        subjectId,
      )
      .maybeSingle();


  if (teachingError) {
    throw new Error(
      `Failed to verify teaching subject: ${teachingError.message}`,
    );
  }


  if (!teachingSubject) {
    throw new Error(
      "You are not assigned to this subject.",
    );
  }


  const {
    data: assignment,
    error,
  } =
    await supabase
      .from("assignments")
      .select("id")
      .eq(
        "id",
        assignmentId,
      )
      .eq(
        "faculty_id",
        facultyId,
      )
      .maybeSingle();


  if (error) {
    throw new Error(
      `Failed to load assignment: ${error.message}`,
    );
  }


  if (!assignment) {
    throw new Error(
      "Assignment not found or access denied.",
    );
  }


  const {
    error: updateError,
  } =
    await supabase
      .from("assignments")
      .update({
        subject_id:
          subjectId,

        title,

        description:
          description ||
          null,

        due_date:
          dueDate ||
          null,

        priority,
      })
      .eq(
        "id",
        assignmentId,
      )
      .eq(
        "faculty_id",
        facultyId,
      );


  if (updateError) {
    throw new Error(
      `Failed to update assignment: ${updateError.message}`,
    );
  }


  revalidatePath(
    "/faculty/assignments",
  );

  revalidatePath(
    `/faculty/assignments/${assignmentId}`,
  );

  revalidatePath(
    "/faculty",
  );
}


/* ============================================================
   GRADE SUBMISSION
   ============================================================ */

export async function gradeAssignmentSubmission(
  formData: FormData,
) {
  const supabase =
    await createClient();

  const facultyId =
    await getFacultyId();

  const {
    profile,
  } =
    await requireFaculty();


  const submissionId =
    String(
      formData.get(
        "submission_id",
      ) ?? "",
    );


  const marksValue =
    String(
      formData.get(
        "marks",
      ) ?? "",
    ).trim();


  const feedback =
    String(
      formData.get(
        "feedback",
      ) ?? "",
    ).trim();


  if (!submissionId) {
    throw new Error(
      "Submission ID is required.",
    );
  }


  const marks =
    marksValue === ""
      ? null
      : Number(
          marksValue,
        );


  if (
    marks !== null &&
    (!Number.isFinite(
      marks,
    ) ||
      marks < 0)
  ) {
    throw new Error(
      "Marks must be a valid non-negative number.",
    );
  }


  const {
    data: submission,
    error,
  } =
    await supabase
      .from(
        "assignment_submissions",
      )
      .select(`
        id,
        assignment_id
      `)
      .eq(
        "id",
        submissionId,
      )
      .maybeSingle();


  if (error) {
    throw new Error(
      `Failed to load submission: ${error.message}`,
    );
  }


  if (!submission) {
    throw new Error(
      "Submission not found.",
    );
  }


  const {
    data: assignment,
    error: assignmentError,
  } =
    await supabase
      .from("assignments")
      .select("id")
      .eq(
        "id",
        submission.assignment_id,
      )
      .eq(
        "faculty_id",
        facultyId,
      )
      .maybeSingle();


  if (assignmentError) {
    throw new Error(
      `Failed to verify assignment ownership: ${assignmentError.message}`,
    );
  }


  if (!assignment) {
    throw new Error(
      "You do not own this assignment.",
    );
  }


  const {
    error: updateError,
  } =
    await supabase
      .from(
        "assignment_submissions",
      )
      .update({
        status:
          "graded",

        marks,

        feedback:
          feedback ||
          null,

        graded_by:
          profile.id,

        graded_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        submissionId,
      );


  if (updateError) {
    throw new Error(
      `Failed to grade submission: ${updateError.message}`,
    );
  }


  revalidatePath(
    "/faculty/assignments",
  );

  revalidatePath(
    `/faculty/assignments/${submission.assignment_id}`,
  );

  revalidatePath(
    "/faculty",
  );
}


/* ============================================================
   CREATE ATTENDANCE SESSION
   ============================================================ */

export async function createAttendanceSession(
  formData: FormData,
) {
  const supabase =
    await createClient();

  const facultyId =
    await getFacultyId();


  const subjectId =
    String(
      formData.get(
        "subject_id",
      ) ?? "",
    );


  const sessionDate =
    String(
      formData.get(
        "session_date",
      ) ?? "",
    );


  if (
    !subjectId ||
    !sessionDate
  ) {
    throw new Error(
      "Subject and session date are required.",
    );
  }


  const {
    data: teachingSubject,
    error,
  } =
    await supabase
      .from("faculty_subjects")
      .select("id")
      .eq(
        "faculty_id",
        facultyId,
      )
      .eq(
        "subject_id",
        subjectId,
      )
      .maybeSingle();


  if (error) {
    throw new Error(
      `Failed to verify teaching subject: ${error.message}`,
    );
  }


  if (!teachingSubject) {
    throw new Error(
      "You are not assigned to this subject.",
    );
  }


  const {
    error: insertError,
  } =
    await supabase
      .from(
        "attendance_sessions",
      )
      .insert({
        faculty_id:
          facultyId,

        subject_id:
          subjectId,

        session_date:
          sessionDate,
      });


  if (insertError) {
    throw new Error(
      `Failed to create attendance session: ${insertError.message}`,
    );
  }


  revalidatePath(
    "/faculty/attendance",
  );

  revalidatePath(
    "/faculty",
  );
}


/* ============================================================
   MARK ATTENDANCE
   ============================================================ */

export async function markAttendance(
  formData: FormData,
) {
  const supabase =
    await createClient();

  const facultyId =
    await getFacultyId();


  const sessionId =
    String(
      formData.get(
        "session_id",
      ) ?? "",
    );


  const studentId =
    String(
      formData.get(
        "student_id",
      ) ?? "",
    );


  const status =
    String(
      formData.get(
        "status",
      ) ?? "absent",
    );


  if (
    !sessionId ||
    !studentId ||
    !status
  ) {
    throw new Error(
      "Session, student and attendance status are required.",
    );
  }


  const {
    data: session,
    error,
  } =
    await supabase
      .from(
        "attendance_sessions",
      )
      .select(`
        id,
        faculty_id
      `)
      .eq(
        "id",
        sessionId,
      )
      .eq(
        "faculty_id",
        facultyId,
      )
      .maybeSingle();


  if (error) {
    throw new Error(
      `Failed to load attendance session: ${error.message}`,
    );
  }


  if (!session) {
    throw new Error(
      "Attendance session not found.",
    );
  }


  const {
    data: existing,
    error: existingError,
  } =
    await supabase
      .from(
        "attendance_records",
      )
      .select(`
        id,
        status
      `)
      .eq(
        "session_id",
        sessionId,
      )
      .eq(
        "student_id",
        studentId,
      )
      .maybeSingle();


  if (existingError) {
    throw new Error(
      `Failed to check attendance record: ${existingError.message}`,
    );
  }


  if (existing) {
    const {
      error: updateError,
    } =
      await supabase
        .from(
          "attendance_records",
        )
        .update({
          status,

          marked_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          existing.id,
        );


    if (updateError) {
      throw new Error(
        `Failed to update attendance: ${updateError.message}`,
      );
    }
  } else {
    const {
      error: insertError,
    } =
      await supabase
        .from(
          "attendance_records",
        )
        .insert({
          session_id:
            sessionId,

          student_id:
            studentId,

          status,

          marked_at:
            new Date().toISOString(),
        });


    if (insertError) {
      throw new Error(
        `Failed to create attendance record: ${insertError.message}`,
      );
    }
  }


  revalidatePath(
    "/faculty/attendance",
  );

  revalidatePath(
    "/faculty/students",
  );

  revalidatePath(
    "/faculty/intelligence",
  );
}


/* ============================================================
   CORRECT ATTENDANCE
   ============================================================ */

export async function correctAttendance(
  formData: FormData,
) {
  const supabase =
    await createClient();

  const facultyId =
    await getFacultyId();


  const {
    profile,
  } =
    await requireFaculty();


  const recordId =
    String(
      formData.get(
        "record_id",
      ) ?? "",
    );


  const newStatus =
    String(
      formData.get(
        "new_status",
      ) ?? "",
    );


  const reason =
    String(
      formData.get(
        "reason",
      ) ?? "",
    ).trim();


  if (
    !recordId ||
    !newStatus
  ) {
    throw new Error(
      "Attendance record and new status are required.",
    );
  }


  const {
    data: record,
    error,
  } =
    await supabase
      .from(
        "attendance_records",
      )
      .select(`
        id,
        status,
        session_id
      `)
      .eq(
        "id",
        recordId,
      )
      .maybeSingle();


  if (error) {
    throw new Error(
      `Failed to load attendance record: ${error.message}`,
    );
  }


  if (!record) {
    throw new Error(
      "Attendance record not found.",
    );
  }


  const {
    data: session,
    error: sessionError,
  } =
    await supabase
      .from(
        "attendance_sessions",
      )
      .select("id")
      .eq(
        "id",
        record.session_id,
      )
      .eq(
        "faculty_id",
        facultyId,
      )
      .maybeSingle();


  if (sessionError) {
    throw new Error(
      `Failed to verify attendance session: ${sessionError.message}`,
    );
  }


  if (!session) {
    throw new Error(
      "You cannot correct this attendance record.",
    );
  }


  if (
    record.status ===
    newStatus
  ) {
    return;
  }


  const {
    error: correctionError,
  } =
    await supabase
      .from(
        "attendance_corrections",
      )
      .insert({
        attendance_record_id:
          record.id,

        old_status:
          record.status,

        new_status:
          newStatus,

        reason:
          reason ||
          null,

        corrected_by:
          profile.id,
      });


  if (correctionError) {
    throw new Error(
      `Failed to save attendance correction: ${correctionError.message}`,
    );
  }


  const {
    error: updateError,
  } =
    await supabase
      .from(
        "attendance_records",
      )
      .update({
        status:
          newStatus,

        marked_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        record.id,
      );


  if (updateError) {
    throw new Error(
      `Failed to update attendance record: ${updateError.message}`,
    );
  }


  revalidatePath(
    "/faculty/attendance",
  );

  revalidatePath(
    "/faculty/students",
  );

  revalidatePath(
    "/faculty/intelligence",
  );
}