import { PageHeader } from "@/components/layout/page-header";
import { ExamList } from "@/components/exams/exam-list";
import { ExamPreparationOverview } from "@/components/exams/exam-preparation-overview";
import { NextExamCard } from "@/components/exams/next-exam-card";
import { getExamsData } from "@/services/exams/exams-data";

function getDaysRemaining(
  examDate: string,
) {
  const todayString =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
      },
    ).format(new Date());

  const today = new Date(
    `${todayString}T00:00:00+05:30`,
  );

  const exam = new Date(
    `${examDate}T00:00:00+05:30`,
  );

  return Math.round(
    (exam.getTime() -
      today.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

export default async function ExamsPage() {
  const data =
    await getExamsData();

  const upcomingWithDays =
    data.upcomingExams.map(
      (exam) => ({
        exam,
        daysRemaining:
          getDaysRemaining(
            exam.examDate,
          ),
      }),
    );

  const examsWithinSevenDays =
    upcomingWithDays.filter(
      ({ daysRemaining }) =>
        daysRemaining >= 0 &&
        daysRemaining <= 7,
    ).length;

  const overview = {
    totalUpcomingExams:
      data.upcomingExams.length,
    examsWithinSevenDays,
    averageReadiness: 0,
    subjectsNeedingRevision: 0,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academic Intelligence"
        title="Exams"
        description="Track your exam schedule, countdowns and preparation from one place."
      />

      <NextExamCard
        exam={data.nextExam}
        daysRemaining={
          data.nextExam
            ? getDaysRemaining(
                data.nextExam.examDate,
              )
            : null
        }
      />

      <ExamPreparationOverview
        overview={overview}
      />

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            Upcoming exams
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your scheduled assessments for the current semester.
          </p>
        </div>

        <ExamList
          exams={data.upcomingExams}
        />
      </section>

      {data.completedExams.length >
        0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              Completed exams
            </h2>
          </div>

          <ExamList
            exams={data.completedExams}
          />
        </section>
      )}
    </div>
  );
}