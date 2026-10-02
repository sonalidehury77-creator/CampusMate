
import { createClient } from "@/lib/supabase/server";

import {
  calculateAverage,
  calculateCoverage,
  calculateDaysRemaining,
  calculateExamPercentage,
  calculateReadiness,
  calculateWeakTopic,
} from "@/lib/examination/calculations";

import type {
  ExamIntelligenceData,
  ExamItem,
  ExamPerformance,
  ExamPerformanceSummary,
  ExamPreparationSummary,
  ExamRevisionItem,
  ExamRevisionPlan,
  ExamSubjectPreparation,
  ExamTopicProgress,
} from "@/types/examination";

function getString(
  value: unknown,
): string | null {
  return typeof value === "string"
    ? value
    : null;
}

function getNumber(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : null;
  }

  return null;
}

function getExamDate(
  exam: Record<string, unknown>,
): string | null {
  return (
    getString(exam.exam_date) ??
    getString(exam.date) ??
    getString(exam.examDate)
  );
}

function getStartTime(
  exam: Record<string, unknown>,
): string | null {
  return (
    getString(exam.start_time) ??
    getString(exam.startTime)
  );
}

function getEndTime(
  exam: Record<string, unknown>,
): string | null {
  return (
    getString(exam.end_time) ??
    getString(exam.endTime)
  );
}

function getRoom(
  exam: Record<string, unknown>,
): string | null {
  return (
    getString(exam.room) ??
    getString(exam.room_number) ??
    getString(exam.roomNumber)
  );
}

function getExamType(
  exam: Record<string, unknown>,
): string | null {
  return (
    getString(exam.exam_type) ??
    getString(exam.type) ??
    getString(exam.examType)
  );
}

function getSubjectId(
  exam: Record<string, unknown>,
): string | null {
  return (
    getString(exam.subject_id) ??
    getString(exam.subjectId)
  );
}

export async function getExaminationIntelligence(
  userId: string,
): Promise<ExamIntelligenceData> {
  const supabase = await createClient();

  /*
   * ==========================================================
   * 1. STUDENT
   * ==========================================================
   */

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id, semester_id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (studentError) {
    throw new Error(
      `Unable to load student: ${studentError.message}`,
    );
  }

  if (!student) {
    throw new Error(
      "Student record not found.",
    );
  }

  /*
   * ==========================================================
   * 2. EXAMS
   * ==========================================================
   *
   * We intentionally select * from the existing exams table.
   *
   * This keeps Phase 30 compatible with the existing Exam
   * system rather than replacing or assuming a new schema.
   */

  const {
    data: rawExams,
    error: examError,
  } = await supabase
    .from("exams")
    .select("*");

  if (examError) {
    throw new Error(
      `Unable to load exams: ${examError.message}`,
    );
  }

  const examRows =
    (rawExams ?? []) as unknown as Record<
      string,
      unknown
    >[];

  /*
   * ==========================================================
   * 3. SUBJECTS
   * ==========================================================
   */

  const {
    data: subjects,
    error: subjectError,
  } = await supabase
    .from("subjects")
    .select("id, code, name");

  if (subjectError) {
    throw new Error(
      `Unable to load subjects: ${subjectError.message}`,
    );
  }

  const subjectMap = new Map(
    (subjects ?? []).map(
      (subject) => [
        subject.id,
        subject,
      ],
    ),
  );

  /*
   * ==========================================================
   * 4. NORMALIZE EXAMS
   * ==========================================================
   */

  const now = new Date();

  const exams: ExamItem[] = examRows
    .map((exam) => {
      const id = getString(exam.id);

      const subjectId =
        getSubjectId(exam);

      const examDate =
        getExamDate(exam);

      if (
        !id ||
        !subjectId ||
        !examDate
      ) {
        return null;
      }

      const subject =
        subjectMap.get(subjectId);

      if (!subject) {
        return null;
      }

      const daysRemaining =
        calculateDaysRemaining(
          examDate,
          now,
        );

      let status:
        | "upcoming"
        | "today"
        | "completed";

      if (daysRemaining < 0) {
        status = "completed";
      } else if (
        daysRemaining === 0
      ) {
        status = "today";
      } else {
        status = "upcoming";
      }

      return {
        id,

        subjectId,

        subjectCode:
          subject.code,

        subjectName:
          subject.name,

        examType:
          getExamType(exam),

        examDate,

        startTime:
          getStartTime(exam),

        endTime:
          getEndTime(exam),

        room:
          getRoom(exam),

        maxMarks:
          getNumber(
            exam.max_marks,
          ) ??
          getNumber(
            exam.total_marks,
          ),

        status,

        daysRemaining:
          Math.max(
            0,
            daysRemaining,
          ),
      };
    })
    .filter(
      (
        exam,
      ): exam is ExamItem =>
        exam !== null,
    )
    .sort(
      (a, b) =>
        a.examDate.localeCompare(
          b.examDate,
        ),
    );

  /*
   * ==========================================================
   * 5. UPCOMING EXAMS
   * ==========================================================
   */

  const upcomingExams =
    exams.filter(
      (exam) =>
        exam.status ===
          "upcoming" ||
        exam.status ===
          "today",
    );

  /*
   * ==========================================================
   * 6. SYLLABUS TOPICS
   * ==========================================================
   */

  const {
    data: syllabusTopics,
    error: topicError,
  } = await supabase
    .from("syllabus_topics")
    .select("*");

  if (topicError) {
    throw new Error(
      `Unable to load syllabus topics: ${topicError.message}`,
    );
  }

  /*
   * ==========================================================
   * 7. EXISTING TOPIC PROGRESS
   * ==========================================================
   */

  const {
    data: progressRows,
    error: progressError,
  } = await supabase
    .from("exam_topic_progress")
    .select("*")
    .eq(
      "student_id",
      student.id,
    );

  if (progressError) {
    throw new Error(
      `Unable to load exam topic progress: ${progressError.message}`,
    );
  }

  const progressMap = new Map(
    (progressRows ?? []).map(
      (row) => [
        `${row.exam_id}:${row.topic_id}`,
        row,
      ],
    ),
  );

  /*
   * ==========================================================
   * 8. TOPIC NORMALIZATION
   * ==========================================================
   */

  const topicProgress:
    ExamTopicProgress[] = [];

  for (
    const exam of exams
  ) {
    for (
      const topic of
        syllabusTopics ?? []
    ) {
      const topicRecord =
        topic as Record<
          string,
          unknown
        >;

      const topicId =
        getString(
          topicRecord.id,
        );

      if (!topicId) {
        continue;
      }

      const subjectId =
        getString(
          topicRecord.subject_id,
        );

      /*
       * A syllabus topic belongs to a subject.
       * Only connect it to exams for that subject.
       */

      if (
        subjectId !==
        exam.subjectId
      ) {
        continue;
      }

      const progress =
        progressMap.get(
          `${exam.id}:${topicId}`,
        );

      const coverage =
        getNumber(
          progress?.coverage_percentage,
        ) ?? 0;

      const confidence =
        getNumber(
          progress?.confidence_level,
        ) ?? 0;

      const topicName =
        getString(
          topicRecord.name,
        ) ??
        getString(
          topicRecord.title,
        ) ??
        "Untitled topic";

      const unitId =
        getString(
          topicRecord.unit_id,
        );

      const unitName =
        getString(
          topicRecord.unit_name,
        );

      topicProgress.push({
        id:
          getString(
            progress?.id,
          ) ??
          `${exam.id}-${topicId}`,

        examId:
          exam.id,

        topicId,

        unitId,

        topicName,

        unitName,

        status:
          (getString(
            progress?.status,
          ) as ExamTopicProgress["status"]) ??
          "not_started",

        coveragePercentage:
          coverage,

        confidenceLevel:
          confidence,

        estimatedMinutes:
          getNumber(
            progress?.estimated_minutes,
          ) ?? 0,

        actualMinutes:
          getNumber(
            progress?.actual_minutes,
          ) ?? 0,

        lastStudiedAt:
          getString(
            progress?.last_studied_at,
          ),

        isWeak:
          calculateWeakTopic(
            coverage,
            confidence,
          ),
      });
    }
  }

  /*
   * ==========================================================
   * 9. SUBJECT PREPARATION
   * ==========================================================
   */

  const subjectPreparation:
    ExamSubjectPreparation[] =
    exams.map(
      (exam) => {
        const topics =
          topicProgress.filter(
            (topic) =>
              topic.examId ===
              exam.id,
          );

        const completedTopics =
          topics.filter(
            (topic) =>
              topic.status ===
              "completed",
          ).length;

        const inProgressTopics =
          topics.filter(
            (topic) =>
              topic.status ===
                "learning" ||
              topic.status ===
                "revising",
          ).length;

        const weakTopics =
          topics.filter(
            (topic) =>
              topic.isWeak,
          ).length;

        const coveragePercentage =
          calculateCoverage(
            completedTopics,
            topics.length,
          );

        const confidencePercentage =
          topics.length === 0
            ? 0
            : Math.round(
                (topics.reduce(
                  (
                    total,
                    topic,
                  ) =>
                    total +
                    topic.confidenceLevel,
                  0,
                ) /
                  topics.length) *
                  100,
              ) / 100;

        const estimatedMinutes =
          topics.reduce(
            (
              total,
              topic,
            ) =>
              total +
              topic.estimatedMinutes,
            0,
          );

        const actualMinutes =
          topics.reduce(
            (
              total,
              topic,
            ) =>
              total +
              topic.actualMinutes,
            0,
          );

        return {
          subjectId:
            exam.subjectId,

          subjectCode:
            exam.subjectCode,

          subjectName:
            exam.subjectName,

          examId:
            exam.id,

          examDate:
            exam.examDate,

          daysRemaining:
            exam.daysRemaining,

          totalTopics:
            topics.length,

          completedTopics,

          inProgressTopics,

          weakTopics,

          coveragePercentage,

          confidencePercentage,

          estimatedMinutes,

          actualMinutes,

          readiness:
            calculateReadiness(
              coveragePercentage,
              confidencePercentage,
              exam.daysRemaining,
            ),
        };
      },
    );

  /*
   * ==========================================================
   * 10. REVISION PLAN
   * ==========================================================
   */

  const firstUpcomingExam =
    upcomingExams[0];

  let revisionPlan:
    ExamRevisionPlan | null =
    null;

  if (
    firstUpcomingExam
  ) {
    const {
      data: planRow,
      error: planError,
    } = await supabase
      .from(
        "exam_revision_plans",
      )
      .select("*")
      .eq(
        "exam_id",
        firstUpcomingExam.id,
      )
      .eq(
        "student_id",
        student.id,
      )
      .maybeSingle();

    if (planError) {
      throw new Error(
        `Unable to load exam revision plan: ${planError.message}`,
      );
    }

    if (planRow) {
      const {
        data: itemRows,
        error: itemError,
      } = await supabase
        .from(
          "exam_revision_items",
        )
        .select("*")
        .eq(
          "plan_id",
          planRow.id,
        )
        .order(
          "scheduled_date",
          {
            ascending: true,
          },
        );

      if (itemError) {
        throw new Error(
          `Unable to load exam revision items: ${itemError.message}`,
        );
      }

      const topicNameMap =
        new Map(
          topicProgress.map(
            (topic) => [
              topic.topicId,
              topic.topicName,
            ],
          ),
        );

      /*
       * IMPORTANT:
       *
       * Supabase returns text columns as `string`.
       * Our application types intentionally use
       * restricted union types.
       *
       * The casts below narrow the database values
       * to those existing application types.
       *
       * We are NOT changing the database schema or
       * replacing the existing type definitions.
       */

      const items:
        ExamRevisionItem[] =
        (itemRows ?? []).map(
          (item) => ({
            id: item.id,

            topicId:
              item.topic_id,

            topicName:
              item.topic_id
                ? topicNameMap.get(
                    item.topic_id,
                  ) ??
                  null
                : null,

            scheduledDate:
              item.scheduled_date,

            title:
              item.title,

            description:
              item.description,

            plannedMinutes:
              item.planned_minutes,

            actualMinutes:
              item.actual_minutes,

            priority:
              item.priority as ExamRevisionItem["priority"],

            status:
              item.status as ExamRevisionItem["status"],

            completedAt:
              item.completed_at,
          }),
        );

      revisionPlan = {
        id:
          planRow.id,

        examId:
          planRow.exam_id,

        title:
          planRow.title,

        description:
          planRow.description,

        startDate:
          planRow.start_date,

        endDate:
          planRow.end_date,

        availableMinutesPerDay:
          planRow.available_minutes_per_day,

        status:
          planRow.status as ExamRevisionPlan["status"],

        generatedBy:
          planRow.generated_by as ExamRevisionPlan["generatedBy"],

        items,
      };
    }
  }

  /*
   * ==========================================================
   * 11. PERFORMANCE
   * ==========================================================
   */

  const {
    data: performanceRows,
    error:
      performanceError,
  } = await supabase
    .from(
      "exam_performance",
    )
    .select("*")
    .eq(
      "student_id",
      student.id,
    );

  if (performanceError) {
    throw new Error(
      `Unable to load exam performance: ${performanceError.message}`,
    );
  }

  const performance:
    ExamPerformance[] =
    (performanceRows ?? []).map(
      (row) => ({
        id:
          row.id,

        examId:
          row.exam_id,

        marks:
          row.marks,

        maxMarks:
          row.max_marks,

        percentage:
          row.percentage ??
          calculateExamPercentage(
            row.marks,
            row.max_marks,
          ),

        grade:
          row.grade,

        rank:
          row.rank,

        /*
         * Supabase/database text columns are
         * represented as string.
         *
         * ExamPerformance uses a restricted
         * union type, so narrow it here.
         */
        status:
          row.performance_status as ExamPerformance["status"],

        strengths:
          row.strengths ?? [],

        weaknesses:
          row.weaknesses ?? [],

        facultyFeedback:
          row.faculty_feedback,
      }),
    );

  /*
   * ==========================================================
   * 12. PERFORMANCE SUMMARY
   * ==========================================================
   */

  const evaluated =
    performance.filter(
      (item) =>
        item.percentage !==
        null,
    );

  const percentages =
    evaluated
      .map(
        (item) =>
          item.percentage!,
      );

  let strongestSubject:
    string | null =
    null;

  let weakestSubject:
    string | null =
    null;

  if (
    evaluated.length > 0
  ) {
    const sorted =
      [...evaluated].sort(
        (a, b) =>
          (b.percentage ?? 0) -
          (a.percentage ?? 0),
      );

    const strongestExam =
      exams.find(
        (exam) =>
          exam.id ===
          sorted[0].examId,
      );

    const weakestExam =
      exams.find(
        (exam) =>
          exam.id ===
          sorted[
            sorted.length - 1
          ].examId,
      );

    strongestSubject =
      strongestExam?.subjectName ??
      null;

    weakestSubject =
      weakestExam?.subjectName ??
      null;
  }

  const performanceSummary:
    ExamPerformanceSummary =
    {
      totalExams:
        performance.length,

      evaluatedExams:
        evaluated.length,

      averagePercentage:
        calculateAverage(
          percentages,
        ),

      highestPercentage:
        percentages.length > 0
          ? Math.max(
              ...percentages,
            )
          : null,

      lowestPercentage:
        percentages.length > 0
          ? Math.min(
              ...percentages,
            )
          : null,

      strongestSubject,

      weakestSubject,
    };

  /*
   * ==========================================================
   * 13. PREPARATION SUMMARY
   * ==========================================================
   */

  const allTopics =
    topicProgress;

  const completedTopics =
    allTopics.filter(
      (topic) =>
        topic.status ===
        "completed",
    ).length;

  const weakTopics =
    allTopics.filter(
      (topic) =>
        topic.isWeak,
    ).length;

  const overallCoveragePercentage =
    calculateCoverage(
      completedTopics,
      allTopics.length,
    );

  const overallConfidencePercentage =
    allTopics.length === 0
      ? 0
      : Math.round(
          (allTopics.reduce(
            (
              total,
              topic,
            ) =>
              total +
              topic.confidenceLevel,
            0,
          ) /
            allTopics.length) *
            100,
        ) / 100;

  const totalEstimatedMinutes =
    allTopics.reduce(
      (
        total,
        topic,
      ) =>
        total +
        topic.estimatedMinutes,
      0,
    );

  const totalActualMinutes =
    allTopics.reduce(
      (
        total,
        topic,
      ) =>
        total +
        topic.actualMinutes,
      0,
    );

  const nearestExam =
    upcomingExams[0];

  const preparationSummary:
    ExamPreparationSummary =
    {
      overallCoveragePercentage,

      overallConfidencePercentage,

      totalTopics:
        allTopics.length,

      completedTopics,

      weakTopics,

      totalEstimatedMinutes,

      totalActualMinutes,

      readiness:
        calculateReadiness(
          overallCoveragePercentage,
          overallConfidencePercentage,
          nearestExam?.daysRemaining ??
            0,
        ),
    };

  /*
   * ==========================================================
   * 14. FINAL RESULT
   * ==========================================================
   */

  return {
    exams,

    upcomingExams,

    subjectPreparation,

    topicProgress,

    revisionPlan,

    performance,

    performanceSummary,

    preparationSummary,

    lastUpdated:
      new Date().toISOString(),
  };
}
