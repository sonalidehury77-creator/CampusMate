import Link from "next/link";

import { Card } from "@/components/ui/card";

import { requireFaculty } from "@/lib/auth/require-faculty";
import { createClient } from "@/lib/supabase/server";


export default async function FacultyAssignmentsPage() {

  const {
    profile,
  } =
    await requireFaculty();

  const supabase =
    await createClient();


  /* ==========================================================
     LOAD FACULTY
  ========================================================== */

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

  if (facultyError) {
    throw new Error(
      `Failed to load faculty: ${facultyError.message}`,
    );
  }

  if (!faculty) {
    throw new Error(
      "Faculty record not found.",
    );
  }


  /* ==========================================================
     LOAD ASSIGNMENTS
  ========================================================== */

  const {
    data: assignments,
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
        attachment_path,
        created_at
      `)
      .eq(
        "faculty_id",
        faculty.id,
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      );

  if (assignmentError) {
    throw new Error(
      `Failed to load assignments: ${assignmentError.message}`,
    );
  }


  /* ==========================================================
     LOAD SUBJECTS
  ========================================================== */

  const subjectIds =
    [
      ...new Set(
        (
          assignments ??
          []
        ).map(
          (
            assignment,
          ) =>
            assignment.subject_id,
        ),
      ),
    ];


  let subjects: {
    id: string;
    code: string;
    name: string;
  }[] = [];


  if (
    subjectIds.length >
    0
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from("subjects")
        .select(
          "id, code, name",
        )
        .in(
          "id",
          subjectIds,
        );

    if (error) {
      throw new Error(
        `Failed to load subjects: ${error.message}`,
      );
    }

    subjects =
      data ?? [];
  }


  const subjectMap =
    new Map(
      subjects.map(
        (
          subject,
        ) => [
          subject.id,
          subject,
        ],
      ),
    );


  return (
    <div className="space-y-8">

      <div>

        <p className="text-sm font-semibold text-brand-600">
          Faculty Workspace
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Assignments
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create assignments and review student submissions.
        </p>

      </div>


      {(
        assignments ??
        []
      ).length ===
      0 ? (

        <Card className="p-8 text-center">

          <h2 className="text-lg font-semibold">
            No assignments yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Create your first assignment from the faculty workspace.
          </p>

        </Card>

      ) : (

        <div className="grid gap-5">

          {(
            assignments ??
            []
          ).map(
            (
              assignment,
            ) => {

              const subject =
                subjectMap.get(
                  assignment.subject_id,
                );


              return (
                <Card
                  key={
                    assignment.id
                  }
                  className="p-6"
                >

                  <div className="flex flex-col justify-between gap-5 md:flex-row">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                        {subject?.code ??
                          "Subject"}
                      </p>


                      <h2 className="mt-2 text-xl font-bold">
                        {
                          assignment.title
                        }
                      </h2>


                      <p className="mt-2 text-sm text-slate-500">
                        {subject?.name ??
                          "Unknown subject"}
                      </p>


                      {assignment.description && (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                          {
                            assignment.description
                          }
                        </p>
                      )}


                      {assignment.due_date && (
                        <p className="mt-4 text-sm text-slate-500">
                          Due:{" "}

                          {new Date(
                            assignment.due_date,
                          ).toLocaleString(
                            "en-IN",
                          )}
                        </p>
                      )}

                    </div>


                    <div className="flex items-start">

                      <Link
                        href={`/faculty/assignments/${assignment.id}`}
                        className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        View Submissions
                      </Link>

                    </div>

                  </div>

                </Card>
              );
            },
          )}

        </div>

      )}

    </div>
  );
}