import {
  createClient,
} from "@/lib/supabase/server";

import {
  calculateAttendanceRisk,
  calculateConfidenceGap,
  calculateCoverageGap,
  calculateDeadlineUrgency,
  calculateExamUrgency,
  calculateWeaknessScore,
  calculateStudyPriorityScore,
  getStudyPriority,
} from "@/lib/study/calculations";

import type {
  StudyTaskCandidate,
} from "@/types/study";

type StudyDatabaseRow =
  Record<string, unknown>;

function toRows(
  value: unknown,
): StudyDatabaseRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as StudyDatabaseRow[];
}

function toRow(
  value: unknown,
): StudyDatabaseRow | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as StudyDatabaseRow;
}

function getString(
  row: StudyDatabaseRow,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value =
      row[key];

    if (
      typeof value === "string" &&
      value.trim().length > 0
    ) {
      return value;
    }
  }

  return null;
}

function getNumber(
  row: StudyDatabaseRow,
  ...keys: string[]
): number | null {
  for (const key of keys) {
    const value =
      row[key];

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
      const parsed =
        Number(value);

      if (
        Number.isFinite(parsed)
      ) {
        return parsed;
      }
    }
  }

  return null;
}

function getBoolean(
  row: StudyDatabaseRow,
  ...keys: string[]
): boolean | null {
  for (const key of keys) {
    const value =
      row[key];

    if (
      typeof value === "boolean"
    ) {
      return value;
    }

    if (
      typeof value === "string"
    ) {
      const normalized =
        value.toLowerCase();

      if (
        normalized === "true"
      ) {
        return true;
      }

      if (
        normalized === "false"
      ) {
        return false;
      }
    }

    if (
      typeof value === "number"
    ) {
      if (value === 1) {
        return true;
      }

      if (value === 0) {
        return false;
      }
    }
  }

  return null;
}

export async function buildStudyCandidates(): Promise<
  StudyTaskCandidate[]
> {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Authentication required.",
    );
  }

  const {
    data: student,
    error: studentError,
  } =
    await supabase
      .from("students")
      .select("id")
      .eq(
        "profile_id",
        user.id,
      )
      .maybeSingle();

  if (studentError) {
    throw studentError;
  }

  if (!student) {
    throw new Error(
      "Student not found.",
    );
  }

  /*
   * ----------------------------------------------------------
   * Subjects
   * ----------------------------------------------------------
   */

  const {
    data: subjects,
    error: subjectError,
  } =
    await supabase
      .from("subjects")
      .select("*");

  if (subjectError) {
    throw subjectError;
  }

  const subjectRows =
    toRows(subjects);

  /*
   * ----------------------------------------------------------
   * Exams
   * ----------------------------------------------------------
   */

  const {
    data: exams,
    error: examError,
  } =
    await supabase
      .from("exams")
      .select("*")
      .order(
        "exam_date",
        {
          ascending: true,
        },
      );

  if (examError) {
    throw examError;
  }

  const examRows =
    toRows(exams);

  /*
   * ----------------------------------------------------------
   * Assignments
   * ----------------------------------------------------------
   */

  const {
    data: assignments,
    error: assignmentError,
  } =
    await supabase
      .from("assignments")
      .select("*");

  if (assignmentError) {
    throw assignmentError;
  }

  const assignmentRows =
    toRows(assignments);

  /*
   * ----------------------------------------------------------
   * Syllabus topics
   * ----------------------------------------------------------
   */

  const {
    data: topics,
    error: topicError,
  } =
    await supabase
      .from(
        "syllabus_topics",
      )
      .select("*");

  if (topicError) {
    throw topicError;
  }

  const topicRows =
    toRows(topics);

  /*
   * ----------------------------------------------------------
   * Exam topic progress
   * ----------------------------------------------------------
   */

  const {
    data: progressRows,
    error: progressError,
  } =
    await supabase
      .from(
        "exam_topic_progress",
      )
      .select("*")
      .eq(
        "student_id",
        student.id,
      );

  if (progressError) {
    throw progressError;
  }

  const progressData =
    toRows(progressRows);

  /*
   * ----------------------------------------------------------
   * Attendance records
   * ----------------------------------------------------------
   */

  const {
    data: attendanceRows,
    error: attendanceError,
  } =
    await supabase
      .from(
        "attendance_records",
      )
      .select("*")
      .eq(
        "student_id",
        student.id,
      );

  if (attendanceError) {
    throw attendanceError;
  }

  const attendanceData =
    toRows(attendanceRows);

  /*
   * ----------------------------------------------------------
   * Build candidates
   * ----------------------------------------------------------
   */

  const candidates:
    StudyTaskCandidate[] =
    [];

  const today =
    new Date();

  for (
    const subject of
      subjectRows
  ) {
    const subjectId =
      getString(
        subject,
        "id",
      );

    if (!subjectId) {
      continue;
    }

    const subjectName =
      getString(
        subject,
        "name",
        "code",
      ) ??
      "Subject";

    /*
     * --------------------------------------------------------
     * Subject topics
     * --------------------------------------------------------
     */

    const subjectTopics =
      topicRows.filter(
        (topic) =>
          getString(
            topic,
            "subject_id",
            "subjectId",
          ) === subjectId,
      );

    /*
     * --------------------------------------------------------
     * Subject progress
     * --------------------------------------------------------
     */

    const subjectProgress =
      progressData.filter(
        (progress) =>
          getString(
            progress,
            "subject_id",
            "subjectId",
          ) === subjectId,
      );

    const totalTopics =
      subjectTopics.length;

    const completedTopics =
      subjectProgress.filter(
        (progress) =>
          Boolean(
            getBoolean(
              progress,
              "is_completed",
              "completed",
            ) ??
              false,
          ),
      ).length;

    const coveragePercentage =
      totalTopics > 0
        ? Math.round(
            (
              completedTopics /
              totalTopics
            ) *
              100,
          )
        : 0;

    /*
     * --------------------------------------------------------
     * Confidence
     * --------------------------------------------------------
     */

    const confidenceValues =
      subjectProgress
        .map(
          (progress) =>
            getNumber(
              progress,
              "confidence_percentage",
              "confidence",
              "confidence_level",
            ) ?? 0,
        )
        .filter(
          (value) =>
            value > 0,
        );

    const confidencePercentage =
      confidenceValues.length > 0
        ? Math.round(
            confidenceValues.reduce(
              (
                sum,
                value,
              ) =>
                sum + value,
              0,
            ) /
              confidenceValues.length,
          )
        : 0;

    /*
     * --------------------------------------------------------
     * Attendance
     * --------------------------------------------------------
     */

    const subjectAttendance =
      attendanceData.filter(
        (record) =>
          getString(
            record,
            "subject_id",
            "subjectId",
          ) === subjectId,
      );

    const attendancePercentage =
      calculateAttendance(
        subjectAttendance,
      );

    /*
     * --------------------------------------------------------
     * Upcoming exam
     * --------------------------------------------------------
     */

    const subjectExams =
      examRows
        .filter(
          (exam) =>
            getString(
              exam,
              "subject_id",
              "subjectId",
            ) === subjectId,
        )
        .filter(
          (exam) =>
            getExamDate(
              exam,
            ) >= today,
        )
        .sort(
          (a, b) =>
            getExamDate(
              a,
            ).getTime() -
            getExamDate(
              b,
            ).getTime(),
        );

    const upcomingExam =
      subjectExams[0];

    /*
     * --------------------------------------------------------
     * Upcoming assignment
     * --------------------------------------------------------
     */

    const subjectAssignments =
      assignmentRows
        .filter(
          (assignment) =>
            getString(
              assignment,
              "subject_id",
              "subjectId",
            ) === subjectId,
        )
        .filter(
          (assignment) =>
            getAssignmentDate(
              assignment,
            ) !== null,
        )
        .sort(
          (a, b) =>
            (
              getAssignmentDate(
                a,
              )?.getTime() ??
              Number.MAX_SAFE_INTEGER
            ) -
            (
              getAssignmentDate(
                b,
              )?.getTime() ??
              Number.MAX_SAFE_INTEGER
            ),
        );

    const upcomingAssignment =
      subjectAssignments[0];

    /*
     * --------------------------------------------------------
     * Subject-level study task
     * --------------------------------------------------------
     */

    if (
      coveragePercentage < 100 ||
      confidencePercentage < 80
    ) {
      const examDays =
        upcomingExam
          ? daysUntil(
              getExamDate(
                upcomingExam,
              ),
            )
          : 999;

      const assignmentDays =
        upcomingAssignment
          ? daysUntil(
              getAssignmentDate(
                upcomingAssignment,
              )!,
            )
          : 999;

      const examUrgency =
        upcomingExam
          ? calculateExamUrgency(
              examDays,
            )
          : 0;

      const assignmentUrgency =
        upcomingAssignment
          ? calculateDeadlineUrgency(
              assignmentDays,
            )
          : 0;

      const weakness =
        calculateWeaknessScore(
          coveragePercentage,
          confidencePercentage,
        );

      const coverageGap =
        calculateCoverageGap(
          coveragePercentage,
        );

      const confidenceGap =
        calculateConfidenceGap(
          confidencePercentage,
        );

      const attendanceRisk =
        calculateAttendanceRisk(
          attendancePercentage,
        );

      const deadlineRisk =
        Math.max(
          examUrgency,
          assignmentUrgency,
        );

      const priorityScore =
        calculateStudyPriorityScore(
          examUrgency,
          assignmentUrgency,
          weakness,
          coverageGap,
          confidenceGap,
          attendanceRisk,
          deadlineRisk,
        );

      const priority =
        getStudyPriority(
          priorityScore,
        );

      const reasons: string[] =
        [];

      if (
        examUrgency >= 60
      ) {
        reasons.push(
          `Exam approaching in ${examDays} day(s).`,
        );
      }

      if (
        assignmentUrgency >= 60
      ) {
        reasons.push(
          `Assignment deadline approaching in ${assignmentDays} day(s).`,
        );
      }

      if (
        coveragePercentage < 70
      ) {
        reasons.push(
          `Syllabus coverage is ${coveragePercentage}%.`,
        );
      }

      if (
        confidencePercentage < 70
      ) {
        reasons.push(
          `Confidence is ${confidencePercentage}%.`,
        );
      }

      if (
        attendanceRisk >= 50
      ) {
        reasons.push(
          "Attendance risk is elevated.",
        );
      }

      candidates.push({
        id:
          `subject-${subjectId}`,

        subjectId,

        topicId:
          null,

        examId:
          upcomingExam
            ? getString(
                upcomingExam,
                "id",
              )
            : null,

        assignmentId:
          upcomingAssignment
            ? getString(
                upcomingAssignment,
                "id",
              )
            : null,

        title:
          `Study ${subjectName}`,

        description:
          `Personalized study task for ${subjectName}.`,

        studyType:
          upcomingExam
            ? "exam_preparation"
            : "study",

        priority,

        priorityScore,

        plannedMinutes:
          priority === "critical"
            ? 60
            : priority === "high"
              ? 50
              : priority === "medium"
                ? 40
                : 30,

        dueDate:
          upcomingExam
            ? toDateString(
                getExamDate(
                  upcomingExam,
                ),
              )
            : upcomingAssignment
              ? toDateString(
                  getAssignmentDate(
                    upcomingAssignment,
                  )!,
                )
              : null,

        subjectName,

        topicName:
          null,

        coveragePercentage,

        confidencePercentage,

        attendancePercentage,

        reason:
          reasons.length > 0
            ? reasons
            : [
                "Regular study supports academic progress.",
              ],
      });
    }

    /*
     * --------------------------------------------------------
     * Weak topic candidates
     * --------------------------------------------------------
     */

    for (
      const topic of
        subjectTopics
    ) {
      const topicId =
        getString(
          topic,
          "id",
        );

      if (!topicId) {
        continue;
      }

      const progress =
        subjectProgress.find(
          (row) =>
            getString(
              row,
              "topic_id",
              "topicId",
            ) === topicId,
        );

      const topicCoverage =
        getNumber(
          progress ?? {},
          "coverage_percentage",
          "coverage",
        ) ?? 0;

      const topicConfidence =
        getNumber(
          progress ?? {},
          "confidence_percentage",
          "confidence",
          "confidence_level",
        ) ?? 0;

      if (
        topicCoverage >= 70 &&
        topicConfidence >= 60
      ) {
        continue;
      }

      const weakness =
        calculateWeaknessScore(
          topicCoverage,
          topicConfidence,
        );

      const score =
        Math.max(
          weakness,
          calculateCoverageGap(
            topicCoverage,
          ),
          calculateConfidenceGap(
            topicConfidence,
          ),
        );

      const topicName =
        getString(
          topic,
          "name",
          "title",
        ) ??
        "Weak topic";

      candidates.push({
        id:
          `topic-${topicId}`,

        subjectId,

        topicId,

        examId:
          upcomingExam
            ? getString(
                upcomingExam,
                "id",
              )
            : null,

        assignmentId:
          null,

        title:
          `Revise ${topicName}`,

        description:
          "This topic has incomplete coverage or low confidence.",

        studyType:
          "weak_topic",

        priority:
          getStudyPriority(
            score,
          ),

        priorityScore:
          score,

        plannedMinutes:
          score >= 80
            ? 50
            : score >= 60
              ? 40
              : 30,

        dueDate:
          upcomingExam
            ? toDateString(
                getExamDate(
                  upcomingExam,
                ),
              )
            : null,

        subjectName,

        topicName,

        coveragePercentage:
          topicCoverage,

        confidencePercentage:
          topicConfidence,

        attendancePercentage,

        reason: [
          `Topic coverage is ${topicCoverage}%.`,
          `Topic confidence is ${topicConfidence}%.`,
        ],
      });
    }
  }

  return candidates.sort(
    (a, b) =>
      b.priorityScore -
      a.priorityScore,
  );
}

function calculateAttendance(
  rows: StudyDatabaseRow[],
): number | null {
  if (
    rows.length === 0
  ) {
    return null;
  }

  let attended = 0;
  let counted = 0;

  for (
    const row of rows
  ) {
    const status =
      (
        getString(
          row,
          "status",
        ) ?? ""
      ).toLowerCase();

    if (
      status === "excused"
    ) {
      continue;
    }

    counted++;

    if (
      status === "present" ||
      status === "late"
    ) {
      attended++;
    }
  }

  if (
    counted === 0
  ) {
    return null;
  }

  return Math.round(
    (
      attended /
      counted
    ) *
      10000,
  ) / 100;
}

function getExamDate(
  exam: StudyDatabaseRow,
): Date {
  const value =
    getString(
      exam,
      "exam_date",
      "date",
      "examDate",
    );

  if (!value) {
    return new Date(
      "invalid",
    );
  }

  return new Date(
    `${value}T23:59:59`,
  );
}

function getAssignmentDate(
  assignment: StudyDatabaseRow,
): Date | null {
  const value =
    getString(
      assignment,
      "due_date",
      "deadline",
      "dueDate",
    );

  if (!value) {
    return null;
  }

  return new Date(
    `${value}T23:59:59`,
  );
}

function daysUntil(
  date: Date,
): number {
  return Math.ceil(
    (
      date.getTime() -
      Date.now()
    ) /
      (
        1000 *
        60 *
        60 *
        24
      ),
  );
}

function toDateString(
  date: Date,
): string {
  return date
    .toISOString()
    .slice(
      0,
      10,
    );
}

export async function generateTodayStudyPlan() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Authentication required.",
    );
  }

  const {
    data: student,
    error: studentError,
  } =
    await supabase
      .from("students")
      .select("id")
      .eq(
        "profile_id",
        user.id,
      )
      .maybeSingle();

  if (studentError) {
    throw studentError;
  }

  if (!student) {
    throw new Error(
      "Student not found.",
    );
  }

  const candidates =
    await buildStudyCandidates();

  const {
    data: preferences,
    error: preferencesError,
  } =
    await supabase
      .from(
        "smart_study_preferences",
      )
      .select("*")
      .eq(
        "student_id",
        student.id,
      )
      .maybeSingle();

  if (preferencesError) {
    throw preferencesError;
  }

  const preferenceRow =
    toRow(preferences);

  const availableMinutes =
    getNumber(
      preferenceRow ?? {},
      "daily_target_minutes",
    ) ?? 120;

  const minimumSessionMinutes =
    getNumber(
      preferenceRow ?? {},
      "minimum_session_minutes",
    ) ?? 25;

  const maximumSessionMinutes =
    getNumber(
      preferenceRow ?? {},
      "maximum_session_minutes",
    ) ?? 60;

  const {
    generateDailySchedule,
  } =
    await import(
      "@/lib/study/scheduler"
    );

  const schedule =
    generateDailySchedule(
      candidates,
      availableMinutes,
      minimumSessionMinutes,
      maximumSessionMinutes,
    );

  const today =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Asia/Kolkata",
      },
    ).format(
      new Date(),
    );

  /*
   * Replace only today's generated
   * smart daily plan.
   *
   * Historical plans remain untouched.
   */

  const {
    error: deleteError,
  } =
    await supabase
      .from(
        "smart_study_plans",
      )
      .delete()
      .eq(
        "student_id",
        student.id,
      )
      .eq(
        "plan_date",
        today,
      )
      .eq(
        "plan_type",
        "daily",
      );

  if (deleteError) {
    throw deleteError;
  }

  const plannedMinutes =
    schedule.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.plannedMinutes,
      0,
    );

  const {
    data: plan,
    error: planError,
  } =
    await supabase
      .from(
        "smart_study_plans",
      )
      .insert({
        student_id:
          student.id,

        plan_date:
          today,

        plan_type:
          "daily",

        status:
          "active",

        available_minutes:
          availableMinutes,

        planned_minutes:
          plannedMinutes,

        completed_minutes:
          0,

        completion_percentage:
          0,

        generated_by:
          "rule_engine",

        generation_reason: {
          reasons: [
            "Generated from examinations, assignments, syllabus coverage, confidence, attendance and study preferences.",
          ],
        },
      })
      .select()
      .single();

  if (planError) {
    throw planError;
  }

  if (
    schedule.length > 0
  ) {
    let elapsedMinutes = 0;

    const items =
      schedule.map(
        (
          scheduled,
          index,
        ) => {
          const startTime =
            calculateStartTime(
              getString(
                preferenceRow ?? {},
                "preferred_start_time",
              ),
              elapsedMinutes,
            );

          const endTime =
            calculateEndTime(
              getString(
                preferenceRow ?? {},
                "preferred_start_time",
              ),
              elapsedMinutes,
              scheduled.plannedMinutes,
            );

          elapsedMinutes +=
            scheduled.plannedMinutes;

          /*
           * Keep a small transition gap
           * between consecutive sessions.
           */
          if (
            index <
            schedule.length - 1
          ) {
            elapsedMinutes += 5;
          }

          return {
            plan_id:
              plan.id,

            student_id:
              student.id,

            subject_id:
              scheduled.candidate
                .subjectId,

            topic_id:
              scheduled.candidate
                .topicId,

            exam_id:
              scheduled.candidate
                .examId,

            assignment_id:
              scheduled.candidate
                .assignmentId,

            title:
              scheduled.candidate
                .title,

            description:
              scheduled.candidate
                .description,

            study_type:
              scheduled.candidate
                .studyType,

            priority:
              scheduled.priority,

            scheduled_date:
              today,

            planned_minutes:
              scheduled.plannedMinutes,

            actual_minutes:
              0,

            status:
              "pending",

            completion_percentage:
              0,

            priority_score:
              scheduled.priorityScore,

            difficulty_score:
              0,

            recommendation_reason: {
              reasons:
                scheduled.candidate
                  .reason,

              score:
                scheduled.priorityScore,
            },

            start_time:
              startTime,

            end_time:
              endTime,
          };
        },
      );

    const {
      error: itemError,
    } =
      await supabase
        .from(
          "smart_study_items",
        )
        .insert(items);

    if (itemError) {
      throw itemError;
    }
  }

  return plan;
}

function calculateStartTime(
  preferredStartTime:
    | string
    | null
    | undefined,
  elapsedMinutes: number,
): string | null {
  if (
    !preferredStartTime
  ) {
    return null;
  }

  const [
    hour,
    minute,
  ] =
    preferredStartTime
      .split(":")
      .map(Number);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  const totalMinutes =
    hour * 60 +
    minute +
    elapsedMinutes;

  const finalHour =
    Math.floor(
      totalMinutes / 60,
    ) % 24;

  const finalMinute =
    totalMinutes % 60;

  return `${String(
    finalHour,
  ).padStart(
    2,
    "0",
  )}:${String(
    finalMinute,
  ).padStart(
    2,
    "0",
  )}:00`;
}

function calculateEndTime(
  preferredStartTime:
    | string
    | null
    | undefined,
  elapsedMinutes: number,
  duration: number,
): string | null {
  if (
    !preferredStartTime
  ) {
    return null;
  }

  const [
    hour,
    minute,
  ] =
    preferredStartTime
      .split(":")
      .map(Number);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  const totalMinutes =
    hour * 60 +
    minute +
    elapsedMinutes +
    duration;

  const finalHour =
    Math.floor(
      totalMinutes / 60,
    ) % 24;

  const finalMinute =
    totalMinutes % 60;

  return `${String(
    finalHour,
  ).padStart(
    2,
    "0",
  )}:${String(
    finalMinute,
  ).padStart(
    2,
    "0",
  )}:00`;
}