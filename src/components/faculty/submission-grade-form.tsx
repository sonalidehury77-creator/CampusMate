"use client";

import { gradeAssignmentSubmission } from "@/services/assignments/submission-actions";

type SubmissionGradeFormProps = {
  submissionId: string;
  currentMarks: number | null;
  currentMaxMarks: number | null;
  currentFeedback: string | null;
};

export function SubmissionGradeForm({
  submissionId,
  currentMarks,
  currentMaxMarks,
  currentFeedback,
}: SubmissionGradeFormProps) {
  return (
    <form
      action={gradeAssignmentSubmission}
      className="mt-5 space-y-4 border-t border-border pt-5"
    >
      <input
        type="hidden"
        name="submission_id"
        value={submissionId}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`marks-${submissionId}`}
            className="text-sm font-semibold"
          >
            Marks
          </label>

          <input
            id={`marks-${submissionId}`}
            name="marks"
            type="number"
            min="0"
            step="0.01"
            defaultValue={currentMarks ?? ""}
            className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor={`max-marks-${submissionId}`}
            className="text-sm font-semibold"
          >
            Maximum Marks
          </label>

          <input
            id={`max-marks-${submissionId}`}
            name="max_marks"
            type="number"
            min="1"
            step="0.01"
            defaultValue={currentMaxMarks ?? ""}
            className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`feedback-${submissionId}`}
          className="text-sm font-semibold"
        >
          Feedback
        </label>

        <textarea
          id={`feedback-${submissionId}`}
          name="feedback"
          rows={4}
          defaultValue={currentFeedback ?? ""}
          placeholder="Give useful feedback to the student..."
          className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Save Grade
      </button>
    </form>
  );
}