import { Card } from "@/components/ui/card";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  requireFaculty,
} from "@/lib/auth/require-faculty";

import {
  getFacultySubjects,
} from "@/services/faculty/faculty-data";

import {
  createAttendanceSession,
  markAttendance,
  correctAttendance,
} from "@/services/faculty/faculty-actions";


export default async function FacultyAttendancePage() {
  const {
    profile,
  } = await requireFaculty();

  const supabase =
    await createClient();

  const subjects =
    await getFacultySubjects();

  const {
    data: faculty,
  } = await supabase
    .from("faculty")
    .select("id")
    .eq(
      "profile_id",
      profile.id,
    )
    .maybeSingle();

  if (!faculty) {
    throw new Error(
      "Faculty record not found.",
    );
  }

  const {
    data: sessions,
  } = await supabase
    .from(
      "attendance_sessions",
    )
    .select(`
      id,
      subject_id,
      session_date
    `)
    .eq(
      "faculty_id",
      faculty.id,
    )
    .order(
      "session_date",
      {
        ascending: false,
      },
    )
    .limit(20);

  const sessionIds =
    (sessions ?? []).map(
      (session) =>
        session.id,
    );

  const {
    data: records,
  } =
    sessionIds.length > 0
      ? await supabase
          .from(
            "attendance_records",
          )
          .select(`
            id,
            session_id,
            student_id,
            status,
            marked_at
          `)
          .in(
            "session_id",
            sessionIds,
          )
      : {
          data: [],
        };

  const studentIds = [
    ...new Set(
      (records ?? []).map(
        (record) =>
          record.student_id,
      ),
    ),
  ];

  const {
    data: students,
  } =
    studentIds.length > 0
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
        };

  const profileIds = [
    ...new Set(
      (students ?? []).map(
        (student) =>
          student.profile_id,
      ),
    ),
  ];

  const {
    data: profiles,
  } =
    profileIds.length > 0
      ? await supabase
          .from("profiles")
          .select(`
            id,
            full_name
          `)
          .in(
            "id",
            profileIds,
          )
      : {
          data: [],
        };

  const profileMap =
    new Map(
      (profiles ?? []).map(
        (profile) => [
          profile.id,
          profile,
        ],
      ),
    );

  const studentMap =
    new Map(
      (students ?? []).map(
        (student) => [
          student.id,
          {
            ...student,
            name:
              profileMap.get(
                student.profile_id,
              )
                ?.full_name ??
              "Student",
          },
        ],
      ),
    );

  const subjectMap =
    new Map(
      subjects.map(
        (subject) => [
          subject.id,
          subject,
        ],
      ),
    );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Teaching
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Attendance
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Create attendance sessions, mark students and correct records with an audit trail.
        </p>
      </div>

      {/* Create session */}

      <Card className="p-6">
        <h2 className="text-lg font-semibold">
          Create Attendance Session
        </h2>

        <form
          action={
            createAttendanceSession
          }
          className="mt-5 grid gap-4 md:grid-cols-3"
        >
          <select
            name="subject_id"
            required
            className="rounded-xl border px-4 py-3 text-sm"
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
            type="date"
            name="session_date"
            required
            className="rounded-xl border px-4 py-3 text-sm"
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Create Session
          </button>
        </form>
      </Card>

      {/* Sessions */}

      <div className="space-y-5">
        {(sessions ?? []).map(
          (session) => {
            const subject =
              subjectMap.get(
                session.subject_id,
              );

            const sessionRecords =
              (records ?? []).filter(
                (record) =>
                  record.session_id ===
                  session.id,
              );

            const sessionStudents =
              (students ?? []).filter(
                (student) =>
                  student.id,
              );

            return (
              <Card
                key={session.id}
                className="overflow-hidden"
              >
                <div className="border-b p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {subject?.name ??
                          "Subject"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {session.session_date}
                      </p>
                    </div>

                    <div className="text-sm">
                      {sessionRecords.length}{" "}
                      records
                    </div>
                  </div>
                </div>

                <div className="divide-y">
                  {sessionStudents.map(
                    (student) => {
                      const record =
                        sessionRecords.find(
                          (item) =>
                            item.student_id ===
                            student.id,
                        );

                      return (
                        <div
                          key={student.id}
                          className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="font-medium">
                              {
                                studentMap.get(
                                  student.id,
                                )?.name
                              }
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {student.student_number}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {[
                              "present",
                              "absent",
                              "late",
                              "excused",
                            ].map(
                              (
                                status,
                              ) => (
                                <form
                                  key={
                                    status
                                  }
                                  action={
                                    markAttendance
                                  }
                                >
                                  <input
                                    type="hidden"
                                    name="session_id"
                                    value={
                                      session.id
                                    }
                                  />

                                  <input
                                    type="hidden"
                                    name="student_id"
                                    value={
                                      student.id
                                    }
                                  />

                                  <input
                                    type="hidden"
                                    name="status"
                                    value={
                                      status
                                    }
                                  />

                                  <button
                                    type="submit"
                                    className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                                      record?.status ===
                                      status
                                        ? "bg-slate-950 text-white"
                                        : "hover:bg-muted"
                                    }`}
                                  >
                                    {status}
                                  </button>
                                </form>
                              ),
                            )}
                          </div>

                          {record && (
                            <form
                              action={
                                correctAttendance
                              }
                              className="flex gap-2"
                            >
                              <input
                                type="hidden"
                                name="record_id"
                                value={
                                  record.id
                                }
                              />

                              <input
                                name="new_status"
                                defaultValue={
                                  record.status
                                }
                                className="w-28 rounded-lg border px-3 py-2 text-xs"
                              />

                              <input
                                name="reason"
                                placeholder="Correction reason"
                                className="w-48 rounded-lg border px-3 py-2 text-xs"
                              />

                              <button
                                type="submit"
                                className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                              >
                                Correct
                              </button>
                            </form>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </Card>
            );
          },
        )}

        {(sessions ?? []).length ===
          0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            No attendance sessions created yet.
          </Card>
        )}
      </div>
    </div>
  );
}