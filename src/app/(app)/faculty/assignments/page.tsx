import Link from "next/link";

import { Card } from "@/components/ui/card";

import {
  getFacultyAssignments,
  getFacultySubjects,
} from "@/services/faculty/faculty-data";

import {
  createFacultyAssignment,
} from "@/services/faculty/faculty-actions";

export default async function FacultyAssignmentsPage() {
  const [
    assignments,
    subjects,
  ] = await Promise.all([
    getFacultyAssignments(),
    getFacultySubjects(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Teaching
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Assignments
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Create assignments, monitor submissions and review student work.
        </p>
      </div>

      {/* Create */}

      <Card className="p-6">
        <h2 className="text-lg font-semibold">
          Create Assignment
        </h2>

        <form
          action={
            createFacultyAssignment
          }
          className="mt-5 grid gap-4 md:grid-cols-2"
        >
          <select
            name="subject_id"
            required
            className="rounded-xl border bg-background px-4 py-3 text-sm"
          >
            <option value="">
              Select subject
            </option>

            {subjects.map(
              (subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.code} —{" "}
                  {subject.name}
                </option>
              ),
            )}
          </select>

          <input
            name="title"
            required
            placeholder="Assignment title"
            className="rounded-xl border bg-background px-4 py-3 text-sm"
          />

          <input
            name="due_date"
            type="datetime-local"
            className="rounded-xl border bg-background px-4 py-3 text-sm"
          />

          <select
            name="priority"
            defaultValue="normal"
            className="rounded-xl border bg-background px-4 py-3 text-sm"
          >
            <option value="low">
              Low priority
            </option>

            <option value="normal">
              Normal priority
            </option>

            <option value="high">
              High priority
            </option>
          </select>

          <textarea
            name="description"
            placeholder="Assignment instructions..."
            className="min-h-28 rounded-xl border bg-background px-4 py-3 text-sm md:col-span-2"
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 md:w-fit"
          >
            Create Assignment
          </button>
        </form>
      </Card>

      {/* Existing assignments */}

      <div className="space-y-4">
        {assignments.map(
          (assignment) => (
            <Card
              key={assignment.id}
              className="p-6"
            >
              <div className="flex flex-col justify-between gap-5 md:flex-row">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                    {assignment.subjectCode}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    {assignment.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {assignment.description ??
                      "No description provided."}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/faculty/assignments/${assignment.id}`}
                    className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Manage
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-3">
                <Stat
                  label="Submissions"
                  value={
                    assignment.submissionCount
                  }
                />

                <Stat
                  label="Graded"
                  value={
                    assignment.gradedCount
                  }
                />

                <Stat
                  label="Pending"
                  value={
                    assignment.pendingCount
                  }
                />
              </div>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}


function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}