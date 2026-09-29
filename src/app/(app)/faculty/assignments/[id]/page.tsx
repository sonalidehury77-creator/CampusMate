import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";

import { requireFaculty } from "@/lib/auth/require-faculty";

import { createClient } from "@/lib/supabase/server";

import {
  gradeAssignmentSubmission,
  updateFacultyAssignment,
} from "@/services/faculty/faculty-actions";


export default async function AssignmentManagementPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const {
    id,
  } =
    await params;


  const {
    profile,
  } =
    await requireFaculty();


  const supabase =
    await createClient();


  // ==========================================================
  // FACULTY
  // ==========================================================

  const {
    data: faculty,
    error: facultyError,
  } =
    await supabase
      .from("faculty")
      .select("id")
      .eq(
        "profile_id",
        profile.id,
      )
      .maybeSingle();


  if (
    facultyError ||
    !faculty
  ) {
    notFound();
  }


  // ==========================================================
  // ASSIGNMENT
  // ==========================================================

  const {
    data: assignment,
    error: assignmentError,
  } =
    await supabase
      .from("assignments")
      .select(`
        id,
        subject_id,
        title,
        description,
        due_date,
        priority
      `)
      .eq(
        "id",
        id,
      )
      .eq(
        "faculty_id",
        faculty.id,
      )
      .maybeSingle();


  if (
    assignmentError ||
    !assignment
  ) {
    notFound();
  }


  // ==========================================================
  // SUBMISSIONS
  // ==========================================================

  const {
    data: submissions,
    error: submissionsError,
  } =
    await supabase
      .from(
        "assignment_submissions",
      )
      .select(`
        id,
        student_id,
        status,
        submission_text,
        submitted_at,
        marks,
        max_marks,
        feedback
      `)
      .eq(
        "assignment_id",
        id,
      )
      .order(
        "submitted_at",
        {
          ascending:
            false,
        },
      );


  if (submissionsError) {
    throw new Error(
      `Failed to load assignment submissions: ${submissionsError.message}`,
    );
  }


  // ==========================================================
  // STUDENT IDS
  // ==========================================================

  const studentIds =
    [
      ...new Set(
        (
          submissions ??
          []
        ).map(
          (submission) =>
            submission.student_id,
        ),
      ),
    ];


  // ==========================================================
  // STUDENTS
  // ==========================================================

  const {
    data: students,
    error: studentsError,
  } =
    studentIds.length >
    0
      ? await supabase
          .from("students")
          .select(`
            id,
            profile_id,
            student_number
          `)
          .in(
            "id",
            studentIds,
          )
      : {
          data: [],
          error: null,
        };


  if (studentsError) {
    throw new Error(
      `Failed to load students: ${studentsError.message}`,
    );
  }


  // ==========================================================
  // PROFILE IDS
  // ==========================================================

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


  // ==========================================================
  // PROFILES
  // ==========================================================

  const {
    data: profiles,
    error: profilesError,
  } =
    profileIds.length >
    0
      ? await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            email
          `)
          .in(
            "id",
            profileIds,
          )
      : {
          data: [],
          error: null,
        };


  if (profilesError) {
    throw new Error(
      `Failed to load student profiles: ${profilesError.message}`,
    );
  }


  // ==========================================================
  // MAP PROFILES
  // ==========================================================

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


  // ==========================================================
  // MAP STUDENTS
  // ==========================================================

  const studentMap =
    new Map(
      (
        students ??
        []
      ).map(
        (student) => [
          student.id,
          {
            ...student,

            profile:
              profileMap.get(
                student.profile_id,
              ),
          },
        ],
      ),
    );


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="space-y-8">

      {/* ---------------------------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------------------------- */}

      <div>
        <p className="text-sm font-semibold text-brand-600">
          Assignment Management
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {assignment.title}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Review submissions, grade students and provide feedback.
        </p>
      </div>


      {/* ---------------------------------------------------- */}
      {/* EDIT ASSIGNMENT */}
      {/* ---------------------------------------------------- */}

      <Card className="p-6">

        <h2 className="text-lg font-semibold">
          Edit Assignment
        </h2>


        <form
          action={
            updateFacultyAssignment
          }
          className="mt-5 space-y-4"
        >

          <input
            type="hidden"
            name="assignment_id"
            value={
              assignment.id
            }
          />


          <input
            type="hidden"
            name="subject_id"
            value={
              assignment.subject_id
            }
          />


          <input
            name="title"
            defaultValue={
              assignment.title
            }
            required
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />


          <textarea
            name="description"
            defaultValue={
              assignment.description ??
              ""
            }
            className="min-h-28 w-full rounded-xl border px-4 py-3 text-sm"
          />


          <input
            name="due_date"
            type="datetime-local"
            defaultValue={
              assignment.due_date
                ? assignment.due_date.slice(
                    0,
                    16,
                  )
                : ""
            }
            className="rounded-xl border px-4 py-3 text-sm"
          />


          <select
            name="priority"
            defaultValue={
              assignment.priority
            }
            className="rounded-xl border px-4 py-3 text-sm"
          >

            <option value="low">
              Low
            </option>

            <option value="normal">
              Normal
            </option>

            <option value="high">
              High
            </option>

          </select>


          <button
            type="submit"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Save Changes
          </button>

        </form>

      </Card>


      {/* ---------------------------------------------------- */}
      {/* SUBMISSIONS */}
      {/* ---------------------------------------------------- */}

      <Card className="overflow-hidden">

        <div className="border-b p-6">

          <h2 className="text-lg font-semibold">
            Student Submissions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Review submitted work and record marks and feedback.
          </p>

        </div>


        <div className="divide-y">

          {(submissions ?? []).map(
            (submission) => {

              const student =
                studentMap.get(
                  submission.student_id,
                );


              return (
                <div
                  key={
                    submission.id
                  }
                  className="space-y-4 p-6"
                >

                  {/* STUDENT INFORMATION */}

                  <div className="flex flex-col justify-between gap-3 md:flex-row">

                    <div>

                      <p className="font-semibold">
                        {
                          student
                            ?.profile
                            ?.full_name ??
                          "Student"
                        }
                      </p>


                      <p className="text-sm text-muted-foreground">
                        {
                          student?.student_number ??
                          "—"
                        }
                      </p>


                      {student
                        ?.profile
                        ?.email && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {
                            student
                              .profile
                              .email
                          }
                        </p>
                      )}

                    </div>


                    <span className="h-fit rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                      {
                        submission.status
                      }
                    </span>

                  </div>


                  {/* SUBMISSION TEXT */}

                  {submission.submission_text && (
                    <div className="rounded-xl bg-muted/40 p-4 text-sm whitespace-pre-wrap">
                      {
                        submission.submission_text
                      }
                    </div>
                  )}


                  {/* SUBMISSION DATE */}

                  {submission.submitted_at && (
                    <p className="text-xs text-muted-foreground">
                      Submitted:{" "}
                      {new Date(
                        submission.submitted_at,
                      ).toLocaleString()}
                    </p>
                  )}


                  {/* GRADING FORM */}

                  <form
                    action={
                      gradeAssignmentSubmission
                    }
                    className="grid gap-3 md:grid-cols-[140px_1fr_auto]"
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
                      step="0.01"
                      min="0"
                      defaultValue={
                        submission.marks ??
                        ""
                      }
                      placeholder={
                        submission.max_marks
                          ? `Marks / ${submission.max_marks}`
                          : "Marks"
                      }
                      className="rounded-xl border px-4 py-3 text-sm"
                    />


                    <input
                      name="feedback"
                      defaultValue={
                        submission.feedback ??
                        ""
                      }
                      placeholder="Feedback"
                      className="rounded-xl border px-4 py-3 text-sm"
                    />


                    <button
                      type="submit"
                      className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Grade
                    </button>

                  </form>

                </div>
              );
            },
          )}


          {(submissions ?? [])
            .length ===
            0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No submissions yet.
            </div>
          )}

        </div>

      </Card>

    </div>
  );
}