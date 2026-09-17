import { createClient } from "@/lib/supabase/server";

import type {
  GlobalSearchResponse,
  SearchFilter,
  SearchResult,
} from "@/types/global-search";

type SubjectRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

type AssignmentRow = {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
};

type NoticeRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string | null;
  deadline: string | null;
};

type StudyPlanRow = {
  id: string;
  title: string;
  subject_id: string | null;
  start_date: string | null;
  end_date: string | null;
};

type StudyTaskRow = {
  id: string;
  study_plan_id: string;
  subject_id: string | null;
  task: string;
  study_date: string;
  status: string;
  duration_minutes: number;
};

type ResourceRow = {
  id: string;
  title: string;
  description: string | null;
  resource_type: string | null;
  subject_id: string | null;
};

type NoteRow = {
  id: string;
  title: string;
  content: string | null;
  subject_id: string | null;
  created_at: string;
};

type ExamRow = {
  id: string;
  subject_id: string;
  exam_date: string;
  exam_type: string;
  start_time: string | null;
  end_time: string | null;
  room: string | null;
};

function normalize(
  value: string | null | undefined,
): string {
  return (value ?? "").trim().toLowerCase();
}

function calculateRelevance(
  query: string,
  title: string,
  description = "",
  metadata = "",
): number {
  const normalizedQuery =
    normalize(query);

  const normalizedTitle =
    normalize(title);

  const normalizedDescription =
    normalize(description);

  const normalizedMetadata =
    normalize(metadata);

  if (!normalizedQuery) {
    return 0;
  }

  let score = 0;

  if (
    normalizedTitle ===
    normalizedQuery
  ) {
    score += 100;
  }

  if (
    normalizedTitle.startsWith(
      normalizedQuery,
    )
  ) {
    score += 80;
  }

  if (
    normalizedTitle.includes(
      normalizedQuery,
    )
  ) {
    score += 60;
  }

  if (
    normalizedMetadata.includes(
      normalizedQuery,
    )
  ) {
    score += 40;
  }

  if (
    normalizedDescription.includes(
      normalizedQuery,
    )
  ) {
    score += 20;
  }

  const words =
    normalizedQuery
      .split(/\s+/)
      .filter(Boolean);

  for (const word of words) {
    if (
      normalizedTitle.includes(
        word,
      )
    ) {
      score += 15;
    }

    if (
      normalizedDescription.includes(
        word,
      )
    ) {
      score += 5;
    }
  }

  return score;
}

function getDayName(
  day: number,
): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    days[day] ??
    "Unknown day"
  );
}

function formatTime(
  time: string,
): string {
  const parts =
    time.split(":");

  if (parts.length < 2) {
    return time;
  }

  const hour =
    Number(parts[0]);

  const minute =
    Number(parts[1]);

  if (Number.isNaN(hour)) {
    return time;
  }

  const period =
    hour >= 12
      ? "PM"
      : "AM";

  const displayHour =
    hour % 12 === 0
      ? 12
      : hour % 12;

  return `${displayHour}:${String(
    minute,
  ).padStart(
    2,
    "0",
  )} ${period}`;
}

export async function searchCampus(
  query: string,
  filter: SearchFilter = "all",
): Promise<GlobalSearchResponse> {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be logged in to search CampusMate.",
    );
  }

  const cleanQuery =
    query.trim();

  if (
    cleanQuery.length < 2
  ) {
    return {
      query: cleanQuery,
      results: [],
      total: 0,
    };
  }

  if (
    cleanQuery.length > 100
  ) {
    throw new Error(
      "Search query is too long.",
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
    throw new Error(
      `Unable to load student information: ${studentError.message}`,
    );
  }

  if (!student) {
    throw new Error(
      "Student onboarding is incomplete.",
    );
  }

  const {
    data: enrollments,
    error: enrollmentError,
  } =
    await supabase
      .from("student_subjects")
      .select(
        `
          subject_id,
          subjects (
            id,
            code,
            name,
            description
          )
        `,
      )
      .eq(
        "student_id",
        student.id,
      );

  if (enrollmentError) {
    throw new Error(
      `Unable to load enrolled subjects: ${enrollmentError.message}`,
    );
  }

  const subjectIds =
    (enrollments ?? [])
      .map(
        (row) =>
          row.subject_id,
      );

  if (
    subjectIds.length === 0
  ) {
    return {
      query: cleanQuery,
      results: [],
      total: 0,
    };
  }

  const shouldSearch = (
    type: SearchFilter,
  ) =>
    filter === "all" ||
    filter === type;

  const results: SearchResult[] =
    [];

  /*
   * SUBJECTS
   */

  if (shouldSearch("subject")) {
    for (const row of
      enrollments ?? []) {
      const subject =
        Array.isArray(
          row.subjects,
        )
          ? row.subjects[0]
          : row.subjects;

      if (!subject) {
        continue;
      }

      const subjectRow =
        subject as SubjectRow;

      const relevance =
        calculateRelevance(
          cleanQuery,
          `${subjectRow.code} ${subjectRow.name}`,
          subjectRow.description ??
            "",
        );

      if (
        relevance <= 0
      ) {
        continue;
      }

      results.push({
        id: subjectRow.id,
        type: "subject",
        title:
          subjectRow.name,
        description:
          subjectRow.description ??
          "Academic subject",
        metadata:
          subjectRow.code,
        href:
          `/academics/${subjectRow.id}`,
        relevance,
      });
    }
  }

  /*
   * ASSIGNMENTS
   */

  if (
    shouldSearch(
      "assignment",
    )
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from("assignments")
        .select(
          `
            id,
            subject_id,
            title,
            description,
            due_date
          `,
        )
        .in(
          "subject_id",
          subjectIds,
        );

    if (error) {
      throw new Error(
        `Unable to search assignments: ${error.message}`,
      );
    }

    for (const row of
      data ?? []) {
      const assignment =
        row as AssignmentRow;

      const relevance =
        calculateRelevance(
          cleanQuery,
          assignment.title,
          assignment.description ??
            "",
        );

      if (
        relevance <= 0
      ) {
        continue;
      }

      const dueText =
        assignment.due_date
          ? `Due ${new Date(
              assignment.due_date,
            ).toLocaleDateString(
              "en-IN",
            )}`
          : "No due date";

      results.push({
        id: assignment.id,
        type: "assignment",
        title:
          assignment.title,
        description:
          assignment.description ??
          "Assignment",
        metadata:
          dueText,
        href:
          "/assignments",
        relevance,
      });
    }
  }

  /*
   * NOTICES
   */

  if (
    shouldSearch("notice")
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from("notices")
        .select(
          `
            id,
            title,
            description,
            category,
            priority,
            deadline
          `,
        )
        .eq(
          "status",
          "published",
        )
        .order(
          "published_at",
          {
            ascending: false,
          },
        )
        .limit(100);

    if (error) {
      throw new Error(
        `Unable to search notices: ${error.message}`,
      );
    }

    for (const row of
      data ?? []) {
      const notice =
        row as NoticeRow;

      const metadata = [
        notice.category,
        notice.priority,
      ]
        .filter(Boolean)
        .join(" ");

      const relevance =
        calculateRelevance(
          cleanQuery,
          notice.title,
          notice.description ??
            "",
          metadata,
        );

      if (
        relevance <= 0
      ) {
        continue;
      }

      const deadlineText =
        notice.deadline
          ? `Deadline ${new Date(
              notice.deadline,
            ).toLocaleDateString(
              "en-IN",
            )}`
          : "No deadline";

      results.push({
        id: notice.id,
        type: "notice",
        title:
          notice.title,
        description:
          notice.description ??
          "Campus notice",
        metadata:
          deadlineText,
        href:
          `/notices/${notice.id}`,
        relevance,
      });
    }
  }

  /*
   * TIMETABLE
   *
   * We search through the student's
   * enrolled subjects only.
   */

  if (
    shouldSearch(
      "timetable",
    )
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "timetable_entries",
        )
        .select(
          `
            id,
            subject_id,
            day_of_week,
            start_time,
            end_time,
            room,
            schedule_type,
            subjects (
              id,
              code,
              name
            )
          `,
        )
        .in(
          "subject_id",
          subjectIds,
        );

    if (error) {
      throw new Error(
        `Unable to search timetable: ${error.message}`,
      );
    }

    for (const row of
      data ?? []) {
      const subject =
        Array.isArray(
          row.subjects,
        )
          ? row.subjects[0]
          : row.subjects;

      const subjectName =
        subject?.name ??
        "Class";

      const subjectCode =
        subject?.code ??
        "";

      const metadata = [
        subjectCode,
        getDayName(
          row.day_of_week,
        ),
        formatTime(
          row.start_time,
        ),
        formatTime(
          row.end_time,
        ),
        row.room,
        row.schedule_type,
      ]
        .filter(Boolean)
        .join(" ");

      const relevance =
        calculateRelevance(
          cleanQuery,
          subjectName,
          metadata,
        );

      if (
        relevance <= 0
      ) {
        continue;
      }

      results.push({
        id: row.id,
        type: "timetable",
        title:
          subjectName,
        description:
          `${getDayName(
            row.day_of_week,
          )} • ${formatTime(
            row.start_time,
          )}–${formatTime(
            row.end_time,
          )}`,
        metadata:
          row.room ??
          row.schedule_type,
        href:
          "/timetable",
        relevance,
      });
    }
  }

    /*
   * RESOURCES
   */

  if (
    shouldSearch("resource")
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from("resources")
        .select(
          `
            id,
            title,
            description,
            resource_type,
            subject_id
          `,
        )
        .in(
          "subject_id",
          subjectIds,
        );

    if (error) {
      throw new Error(
        `Unable to search resources: ${error.message}`,
      );
    }

    for (const row of
      data ?? []) {
      const resource =
        row as ResourceRow;

      const relevance =
        calculateRelevance(
          cleanQuery,
          resource.title,
          resource.description ??
            "",
          resource.resource_type ??
            "",
        );

      if (
        relevance <= 0
      ) {
        continue;
      }

      results.push({
        id: resource.id,
        type: "resource",
        title:
          resource.title,
        description:
          resource.description ??
          "Academic resource",
        metadata:
          resource.resource_type ??
          "Resource",
        href:
          "/resources",
        relevance,
      });
    }
  }

    /*
   * NOTES
   */

  if (
    shouldSearch("note")
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from("notes")
        .select(
          `
            id,
            title,
            content,
            subject_id,
            created_at
          `,
        )
        .in(
          "subject_id",
          subjectIds,
        );

    if (error) {
      throw new Error(
        `Unable to search notes: ${error.message}`,
      );
    }

    for (const row of
      data ?? []) {
      const note =
        row as NoteRow;

      const relevance =
        calculateRelevance(
          cleanQuery,
          note.title,
          note.content ??
            "",
        );

      if (
        relevance <= 0
      ) {
        continue;
      }

      results.push({
        id: note.id,
        type: "note",
        title:
          note.title,
        description:
          note.content
            ? note.content.slice(
                0,
                180,
              )
            : "Personal note",
        metadata:
          new Date(
            note.created_at,
          ).toLocaleDateString(
            "en-IN",
          ),
        href:
          "/resources",
        relevance,
      });
    }
  }

    /*
   * EXAMS
   */

  if (
    shouldSearch("exam")
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from("exams")
        .select(
          `
            id,
            subject_id,
            exam_date,
            exam_type,
            start_time,
            end_time,
            room
          `,
        )
        .in(
          "subject_id",
          subjectIds,
        )
        .order(
          "exam_date",
          {
            ascending: true,
          },
        );

    if (error) {
      throw new Error(
        `Unable to search exams: ${error.message}`,
      );
    }

    for (const row of
      data ?? []) {
      const exam =
        row as ExamRow;

      const subjectResult =
        (enrollments ?? [])
          .find(
            (enrollment) =>
              enrollment.subject_id ===
              exam.subject_id,
          );

      const subject =
        Array.isArray(
          subjectResult?.subjects,
        )
          ? subjectResult?.subjects[0]
          : subjectResult?.subjects;

      const subjectName =
        subject?.name ??
        "Exam";

      const subjectCode =
        subject?.code ??
        "";

      const metadata = [
        subjectCode,
        exam.exam_type,
        exam.room,
      ]
        .filter(Boolean)
        .join(" ");

      const relevance =
        calculateRelevance(
          cleanQuery,
          `${subjectName} ${exam.exam_type}`,
          "",
          metadata,
        );

      if (
        relevance <= 0
      ) {
        continue;
      }

      const examDate =
        new Date(
          exam.exam_date,
        ).toLocaleDateString(
          "en-IN",
        );

      const timeText =
        exam.start_time
          ? ` at ${formatTime(
              exam.start_time,
            )}`
          : "";

      results.push({
        id: exam.id,
        type: "exam",
        title:
          `${subjectName} — ${exam.exam_type}`,
        description:
          `Exam on ${examDate}${timeText}`,
        metadata:
          exam.room ??
          subjectCode,
        href:
          "/academics",
        relevance,
      });
    }
  }

  /*
   * STUDY PLANS
   */

  if (
    shouldSearch(
      "study_plan",
    )
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from("study_plans")
        .select(
          `
            id,
            title,
            subject_id,
            start_date,
            end_date
          `,
        )
        .eq(
          "student_id",
          student.id,
        );

    if (error) {
      throw new Error(
        `Unable to search study plans: ${error.message}`,
      );
    }

    for (const row of
      data ?? []) {
      const plan =
        row as StudyPlanRow;

      const relevance =
        calculateRelevance(
          cleanQuery,
          plan.title,
        );

      if (
        relevance <= 0
      ) {
        continue;
      }

      const dateRange =
        [
          plan.start_date,
          plan.end_date,
        ]
          .filter(Boolean)
          .join(" → ");

      results.push({
        id: plan.id,
        type: "study_plan",
        title:
          plan.title,
        description:
          "Personal study plan",
        metadata:
          dateRange ||
          "Study planner",
        href:
          "/study-planner",
        relevance,
      });
    }
  }

  /*
   * STUDY TASKS
   */

  if (
    shouldSearch(
      "study_task",
    )
  ) {
    const {
      data: plans,
      error: plansError,
    } =
      await supabase
        .from("study_plans")
        .select("id")
        .eq(
          "student_id",
          student.id,
        );

    if (plansError) {
      throw new Error(
        `Unable to load study plans: ${plansError.message}`,
      );
    }

    const planIds =
      plans?.map(
        (plan) => plan.id,
      ) ?? [];

    if (
      planIds.length > 0
    ) {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "study_plan_items",
          )
          .select(
            `
              id,
              study_plan_id,
              subject_id,
              task,
              study_date,
              status,
              duration_minutes
            `,
          )
          .in(
            "study_plan_id",
            planIds,
          );

      if (error) {
        throw new Error(
          `Unable to search study tasks: ${error.message}`,
        );
      }

      for (const row of
        data ?? []) {
        const task =
          row as StudyTaskRow;

        const relevance =
          calculateRelevance(
            cleanQuery,
            task.task,
            task.status,
          );

        if (
          relevance <= 0
        ) {
          continue;
        }

        results.push({
          id: task.id,
          type: "study_task",
          title:
            task.task,
          description:
            `${task.duration_minutes} minutes • ${task.status}`,
          metadata:
            task.study_date,
          href:
            "/study-planner",
          relevance,
        });
      }
    }
  }

  /*
   * RANK + DEDUPLICATE
   */

  results.sort(
    (a, b) =>
      b.relevance -
      a.relevance,
  );

  const uniqueResults: SearchResult[] =
    [];

  const seen =
    new Set<string>();

  for (const result of
    results) {
    const key =
      `${result.type}:${result.id}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    uniqueResults.push(
      result,
    );
  }

  const limitedResults =
    uniqueResults.slice(
      0,
      30,
    );

  return {
    query: cleanQuery,
    results:
      limitedResults,
    total:
      uniqueResults.length,
  };
}