import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { requireFaculty } from "@/lib/auth/require-faculty";
import { createClient } from "@/lib/supabase/server";
import { gradeAssignmentSubmission } from "@/services/faculty/faculty-actions";

type FacultyAssignmentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type StudentRow = {
  id: string;
  student_number: string;
  profile_id: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type SubmissionRow = {
  id: string;
  student_id: string;
  status: string;
  submission_text: string | null;
  attachment_path: string | null;
  submitted_at: string | null;
  marks: number | null;
  max_marks: number | null;
  feedback: string | null;
  graded_at: string | null;
};

type SubmissionDisplayRow = SubmissionRow & {
  studentNumber: string;
  studentName: string;
  studentEmail: string;
  fileUrl: string | null;
};

export default async function FacultyAssignmentPage({
  params,
}: FacultyAssignmentPageProps) {
  const { id } = await params;

  const { profile } = await requireFaculty();

  const supabase = await createClient();

  // ------------------------------------------------------------
  // 1. Find the faculty record
  // ------------------------------------------------------------

  const {
    data: faculty,
    error: facultyError,
  } = await supabase
    .from("faculty")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (facultyError || !faculty) {
    notFound();
  }

  // ------------------------------------------------------------
  // 2. Load assignment owned by this faculty member
  // ------------------------------------------------------------

  const {
    data: assignment,
    error: assignmentError,
  } = await supabase
    .from("assignments")
    .select(
      `
        id,
        faculty_id,
        subject_id,
        title,
        description,
        due_date,
        priority,
        attachment_url
      `,
    )
    .eq("id", id)
    .eq("faculty_id", faculty.id)
    .maybeSingle();

  if (assignmentError || !assignment) {
    notFound();
  }

  // ------------------------------------------------------------
  // 3. Load subject information
  // ------------------------------------------------------------

  const {
    data: subject,
    error: subjectError,
  } = await supabase
    .from("subjects")
    .select("id, name, code")
    .eq("id", assignment.subject_id)
    .maybeSingle();

  if (subjectError) {
    throw new Error(
      `Failed to load subject: ${subjectError.message}`,
    );
  }

  // ------------------------------------------------------------
  // 4. Load submissions
  // ------------------------------------------------------------

  const {
    data: rawSubmissions,
    error: submissionError,
  } = await supabase
    .from("assignment_submissions")
    .select(
      `
        id,
        student_id,
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
    .eq("assignment_id", id)
    .order("submitted_at", {
      ascending: false,
    });

  if (submissionError) {
    throw new Error(
      `Failed to load submissions: ${submissionError.message}`,
    );
  }

  // ------------------------------------------------------------
  // 5. Convert Supabase result to our local display type
  // ------------------------------------------------------------

  const submissions: SubmissionRow[] = (
    rawSubmissions ?? []
  ).map((submission) => ({
    id: submission.id,
    student_id: submission.student_id,
    status: submission.status,
    submission_text: submission.submission_text,
    attachment_path: submission.attachment_path,
    submitted_at: submission.submitted_at,
    marks: submission.marks,
    max_marks: submission.max_marks,
    feedback: submission.feedback,
    graded_at: submission.graded_at,
  }));

  // ------------------------------------------------------------
  // 6. Get student IDs
  // ------------------------------------------------------------

  const studentIds = Array.from(
    new Set(
      submissions.map(
        (submission) => submission.student_id,
      ),
    ),
  );

  // ------------------------------------------------------------
  // 7. Load students
  // ------------------------------------------------------------

  let students: StudentRow[] = [];

  if (studentIds.length > 0) {
    const {
      data,
      error,
    } = await supabase
      .from("students")
      .select(
        `
          id,
          student_number,
          profile_id
        `,
      )
      .in("id", studentIds);

    if (error) {
      throw new Error(
        `Failed to load students: ${error.message}`,
      );
    }

    students = (data ?? []).map((student) => ({
      id: student.id,
      student_number: student.student_number,
      profile_id: student.profile_id,
    }));
  }

  // ------------------------------------------------------------
  // 8. Get profile IDs
  // ------------------------------------------------------------

  const profileIds = Array.from(
    new Set(
      students.map(
        (student) => student.profile_id,
      ),
    ),
  );

  // ------------------------------------------------------------
  // 9. Load student profiles
  // ------------------------------------------------------------

  let studentProfiles: ProfileRow[] = [];

  if (profileIds.length > 0) {
    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .select(
        `
          id,
          full_name,
          email
        `,
      )
      .in("id", profileIds);

    if (error) {
      throw new Error(
        `Failed to load student profiles: ${error.message}`,
      );
    }

    studentProfiles = (data ?? []).map(
      (studentProfile) => ({
        id: studentProfile.id,
        full_name: studentProfile.full_name,
        email: studentProfile.email,
      }),
    );
  }

  // ------------------------------------------------------------
  // 10. Create lookup maps
  // ------------------------------------------------------------

  const studentMap = new Map<string, StudentRow>();

  for (const student of students) {
    studentMap.set(student.id, student);
  }

  const profileMap = new Map<string, ProfileRow>();

  for (const studentProfile of studentProfiles) {
    profileMap.set(
      studentProfile.id,
      studentProfile,
    );
  }

  // ------------------------------------------------------------
  // 11. Generate signed URL for assignment file
  // ------------------------------------------------------------

  let assignmentFileUrl: string | null = null;

  if (assignment.attachment_url) {
    const {
      data: signedFile,
      error: signedFileError,
    } = await supabase.storage
      .from("assignment-files")
      .createSignedUrl(
        assignment.attachment_url,
        3600,
      );

    if (!signedFileError) {
      assignmentFileUrl =
        signedFile?.signedUrl ?? null;
    }
  }

  // ------------------------------------------------------------
  // 12. Prepare submission rows
  // ------------------------------------------------------------

  const submissionRows: SubmissionDisplayRow[] =
    await Promise.all(
      submissions.map(
        async (submission) => {
          const student = studentMap.get(
            submission.student_id,
          );

          const studentProfile = student
            ? profileMap.get(
                student.profile_id,
              )
            : undefined;

          let fileUrl: string | null = null;

          if (submission.attachment_path) {
            const {
              data: signedFile,
              error: signedFileError,
            } = await supabase.storage
              .from("assignment-files")
              .createSignedUrl(
                submission.attachment_path,
                3600,
              );

            if (!signedFileError) {
              fileUrl =
                signedFile?.signedUrl ?? null;
            }
          }

          return {
            ...submission,

            studentNumber:
              student?.student_number ??
              "Unknown",

            studentName:
              studentProfile?.full_name ??
              "Unknown student",

            studentEmail:
              studentProfile?.email ??
              "",

            fileUrl,
          };
        },
      ),
    );

  // ------------------------------------------------------------
  // 13. Statistics
  // ------------------------------------------------------------

  const totalSubmissions =
    submissionRows.length;

  const gradedSubmissions =
    submissionRows.filter(
      (submission) =>
        submission.status === "graded",
    ).length;

  const pendingSubmissions =
    submissionRows.filter(
      (submission) =>
        submission.status !== "graded",
    ).length;

  // ------------------------------------------------------------
  // 14. UI
  // ------------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <Link
          href="/faculty/assignments"
          className="text-sm font-medium text-slate-500 hover:text-slate-950"
        >
          ← Back to assignments
        </Link>

        <p className="mt-5 text-sm font-semibold text-brand-600">
          {subject?.code ?? "Subject"}
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {assignment.title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {subject?.name ?? "Unknown subject"}
        </p>
      </div>

      {/* Statistics */}

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Submissions"
          value={totalSubmissions}
        />

        <Metric
          label="Graded"
          value={gradedSubmissions}
        />

        <Metric
          label="Pending"
          value={pendingSubmissions}
        />
      </div>

      {/* Assignment information */}

      <Card className="p-6">
        <h2 className="text-lg font-semibold">
          Assignment
        </h2>

        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p>
            <span className="font-semibold">
              Due:
            </span>{" "}
            {assignment.due_date
              ? new Date(
                  assignment.due_date,
                ).toLocaleString("en-IN")
              : "No deadline"}
          </p>

          <p>
            <span className="font-semibold">
              Priority:
            </span>{" "}
            <span className="capitalize">
              {assignment.priority}
            </span>
          </p>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
          {assignment.description ||
            "No instructions provided."}
        </p>

        {assignmentFileUrl && (
          <a
            href={assignmentFileUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Open Assignment File
          </a>
        )}
      </Card>

      {/* Student submissions */}

      <div className="space-y-5">
        <h2 className="text-xl font-bold">
          Student Submissions
        </h2>

        {submissionRows.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-slate-500">
              No students have submitted this
              assignment yet.
            </p>
          </Card>
        ) : (
          submissionRows.map(
            (submission) => (
              <Card
                key={submission.id}
                className="p-6"
              >
                <div className="flex flex-col gap-5">
                  {/* Student */}

                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <h3 className="font-semibold">
                        {
                          submission.studentName
                        }
                      </h3>

                      <p className="text-sm text-slate-500">
                        {
                          submission.studentNumber
                        }

                        {submission.studentEmail
                          ? ` · ${submission.studentEmail}`
                          : ""}
                      </p>
                    </div>

                    <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize">
                      {submission.status}
                    </span>
                  </div>

                  {/* Submitted time */}

                  {submission.submitted_at && (
                    <p className="text-xs text-slate-500">
                      Submitted{" "}
                      {new Date(
                        submission.submitted_at,
                      ).toLocaleString(
                        "en-IN",
                      )}
                    </p>
                  )}

                  {/* Submission text */}

                  {submission.submission_text && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Submission
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {
                          submission.submission_text
                        }
                      </p>
                    </div>
                  )}

                  {/* Submission file */}

                  {submission.fileUrl && (
                    <a
                      href={
                        submission.fileUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-fit rounded-xl border px-4 py-2 text-sm font-semibold"
                    >
                      Open Student File
                    </a>
                  )}

                  {/* Grade form */}

                  <form
                    action={
                      gradeAssignmentSubmission
                    }
                    className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-3"
                  >
                    <input
                      type="hidden"
                      name="submission_id"
                      value={
                        submission.id
                      }
                    />

                    <input
                      name="marks"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={
                        submission.marks ??
                        ""
                      }
                      placeholder="Marks"
                      className="rounded-xl border px-4 py-3 text-sm"
                    />

                    <input
                      name="max_marks"
                      type="number"
                      min="1"
                      step="0.01"
                      defaultValue={
                        submission.max_marks ??
                        ""
                      }
                      placeholder="Maximum marks"
                      className="rounded-xl border px-4 py-3 text-sm"
                    />

                    <textarea
                      name="feedback"
                      defaultValue={
                        submission.feedback ??
                        ""
                      }
                      placeholder="Feedback for student"
                      className="min-h-24 rounded-xl border px-4 py-3 text-sm md:col-span-3"
                    />

                    <button
                      type="submit"
                      className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white md:w-fit"
                    >
                      Save Grade & Feedback
                    </button>
                  </form>
                </div>
              </Card>
            ),
          )
        )}
      </div>
    </div>
  );
}

/* ============================================================
   METRIC CARD
============================================================ */

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </Card>
  );
}