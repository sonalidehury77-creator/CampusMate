import Link from "next/link";
import { notFound } from "next/navigation";

import { SubmissionForm } from "@/components/assignments/submission-form";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const {
    data: student,
  } =
    await supabase
      .from("students")
      .select("id")
      .eq(
        "profile_id",
        user.id,
      )
      .maybeSingle();

  if (!student) {
    notFound();
  }

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
        priority,
        attachment_url,
        created_at
      `)
      .eq("id", id)
      .maybeSingle();

  if (assignmentError) {
    throw new Error(
      assignmentError.message,
    );
  }

  if (!assignment) {
    notFound();
  }

  const {
    data: enrollment,
  } =
    await supabase
      .from("student_subjects")
      .select("student_id")
      .eq(
        "student_id",
        student.id,
      )
      .eq(
        "subject_id",
        assignment.subject_id,
      )
      .maybeSingle();

  if (!enrollment) {
    notFound();
  }

  const {
    data: submission,
    error: submissionError,
  } =
    await supabase
      .from("assignment_submissions")
      .select(`
        id,
        status,
        submission_text,
        attachment_path,
        submitted_at,
        marks,
        max_marks,
        feedback,
        graded_at
      `)
      .eq(
        "assignment_id",
        id,
      )
      .eq(
        "student_id",
        student.id,
      )
      .maybeSingle();

  if (submissionError) {
    throw new Error(
      submissionError.message,
    );
  }

  let assignmentFileUrl = "";

  if (assignment.attachment_url) {
    const {
      data,
      error,
    } =
      await supabase.storage
        .from("assignment-files")
        .createSignedUrl(
          assignment.attachment_url,
          3600,
        );

    if (!error) {
      assignmentFileUrl =
        data?.signedUrl ?? "";
    }
  }

  let submissionFileUrl = "";

  if (submission?.attachment_path) {
    const {
      data,
      error,
    } =
      await supabase.storage
        .from("assignment-files")
        .createSignedUrl(
          submission.attachment_path,
          3600,
        );

    if (!error) {
      submissionFileUrl =
        data?.signedUrl ?? "";
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/assignments"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to Assignments
      </Link>

      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assignment
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {assignment.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              {assignment.description ||
                "No description provided."}
            </p>
          </div>

          <div className="rounded-xl bg-muted px-4 py-3 text-sm">
            <p className="text-xs text-muted-foreground">
              Due date
            </p>

            <p className="mt-1 font-semibold">
              {assignment.due_date
                ? new Date(
                    assignment.due_date,
                  ).toLocaleString()
                : "No deadline"}
            </p>
          </div>
        </div>

        {assignmentFileUrl && (
          <a
            href={assignmentFileUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Download Assignment File
          </a>
        )}
      </Card>

      {submission ? (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Your Submission
            </h2>

            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize">
              {submission.status}
            </span>
          </div>

          {submission.submission_text && (
            <div className="mt-5 rounded-xl bg-muted/50 p-4 text-sm leading-7">
              {submission.submission_text}
            </div>
          )}

          {submissionFileUrl && (
            <a
              href={submissionFileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              Download Your Submission
            </a>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                Submitted
              </p>

              <p className="mt-1 text-sm font-semibold">
                {submission.submitted_at
                  ? new Date(
                      submission.submitted_at,
                    ).toLocaleString()
                  : "—"}
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                Marks
              </p>

              <p className="mt-1 text-xl font-bold">
                {submission.marks !== null &&
                submission.max_marks !== null
                  ? `${submission.marks}/${submission.max_marks}`
                  : "Pending"}
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                Graded
              </p>

              <p className="mt-1 text-sm font-semibold">
                {submission.graded_at
                  ? new Date(
                      submission.graded_at,
                    ).toLocaleString()
                  : "Pending"}
              </p>
            </div>
          </div>

          {submission.feedback && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-900">
                Faculty Feedback
              </p>

              <p className="mt-2 text-sm leading-7 text-emerald-800">
                {submission.feedback}
              </p>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="text-xl font-bold">
            Submit Your Work
          </h2>

          <p className="mb-6 mt-2 text-sm text-muted-foreground">
            Submit your answer and optionally attach a file.
          </p>

          <SubmissionForm
            assignmentId={assignment.id}
          />
        </Card>
      )}
    </div>
  );
}