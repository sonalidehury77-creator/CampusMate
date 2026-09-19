import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ExamReadinessCard } from "@/components/exams/exam-readiness-card";
import { createClient } from "@/lib/supabase/server";
import { calculateExamReadiness } from "@/services/exams/exam-readiness";

type ExamDetailPageProps = {
  params: Promise<{
    examId: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "full",
    },
  ).format(
    new Date(
      `${value}T00:00:00+05:30`,
    ),
  );
}

export default async function ExamDetailPage({
  params,
}: ExamDetailPageProps) {
  const { examId } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: student } =
    await supabase
      .from("students")
      .select(
        `
          id,
          semester_id
        `,
      )
      .eq("profile_id", user.id)
      .maybeSingle();

  if (!student) {
    notFound();
  }

  const { data: examRow, error } =
    await supabase
      .from("exams")
      .select(
        `
          id,
          subject_id,
          semester_id,
          exam_type,
          exam_date,
          start_time,
          end_time,
          room,
          subjects (
            code,
            name
          )
        `,
      )
      .eq("id", examId)
      .eq(
        "semester_id",
        student.semester_id,
      )
      .maybeSingle();

  if (error || !examRow) {
    notFound();
  }

  const subject = Array.isArray(
    examRow.subjects,
  )
    ? examRow.subjects[0]
    : examRow.subjects;

  const exam = {
    id: examRow.id,
    subjectId:
      examRow.subject_id,
    subjectCode:
      subject?.code ?? "—",
    subjectName:
      subject?.name ??
      "Unknown subject",
    semesterId:
      examRow.semester_id,
    examType:
      examRow.exam_type,
    examDate:
      examRow.exam_date,
    startTime:
      examRow.start_time,
    endTime:
      examRow.end_time,
    room:
      examRow.room,
  };

  const readiness =
    calculateExamReadiness({
      exam,
      syllabusProgress: 0,
      assignmentCompletion: 0,
      attendancePercentage: null,
      studyConsistency: 0,
    });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Exam Details"
        title={exam.subjectName}
        description={`${exam.subjectCode} · ${exam.examType}`}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">
            Exam date
          </p>

          <p className="mt-2 font-semibold">
            {formatDate(
              exam.examDate,
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">
            Time
          </p>

          <p className="mt-2 font-semibold">
            {exam.startTime ??
              "Not specified"}
            {exam.endTime
              ? ` – ${exam.endTime}`
              : ""}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">
            Room
          </p>

          <p className="mt-2 font-semibold">
            {exam.room ??
              "Not specified"}
          </p>
        </div>
      </section>

      <ExamReadinessCard
        readiness={readiness}
      />
    </div>
  );
}