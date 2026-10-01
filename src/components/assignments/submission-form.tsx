"use client";

import { useState } from "react";

import { submitAssignment } from "@/services/assignments/submission-actions";

import { SubmissionFileUpload } from "@/components/assignments/submission-file-upload";


type SubmissionFormProps = {
  assignmentId: string;
};


export function SubmissionForm({
  assignmentId,
}: SubmissionFormProps) {

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    attachmentPath,
    setAttachmentPath,
  ] =
    useState("");


  async function handleSubmit(
    formData: FormData,
  ) {
    setError("");

    try {
      formData.set(
        "assignment_id",
        assignmentId,
      );

      formData.set(
        "attachment_path",
        attachmentPath,
      );

      await submitAssignment(
        formData,
      );

      /*
        If submitAssignment succeeds,
        Next.js revalidation refreshes
        the assignment page.
      */
    } catch (
      submitError
    ) {
      setError(
        submitError instanceof
          Error
          ? submitError.message
          : "Submission failed.",
      );
    }
  }


  return (
    <form
      action={
        handleSubmit
      }
      className="space-y-6"
    >

      <div>

        <label
          htmlFor="submission_text"
          className="text-sm font-semibold"
        >
          Your submission
        </label>


        <textarea
          id="submission_text"
          name="submission_text"
          rows={7}
          placeholder="Write your answer, explanation or submission notes..."
          className="mt-2 w-full rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-brand-500"
        />

      </div>


      <SubmissionFileUpload
        assignmentId={
          assignmentId
        }
        onUploaded={(
          path,
        ) =>
          setAttachmentPath(
            path,
          )
        }
      />


      {attachmentPath && (
        <p className="text-xs text-emerald-600">
          Submission file is ready.
        </p>
      )}


      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <button
        type="submit"
        className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit Assignment
      </button>

    </form>
  );
}