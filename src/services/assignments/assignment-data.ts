import { createClient } from "@/lib/supabase/server";
import type {
  Assignment,
  AssignmentData,
  AssignmentPriority,
  AssignmentStatus,
} from "@/types/assignments";

const DUE_SOON_HOURS = 48;

function mapPriority(value: string): AssignmentPriority {
  if (
    value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "urgent"
  ) {
    return value;
  }

  return "medium";
}

function mapStatus(value: string): AssignmentStatus {
  if (
    value === "pending" ||
    value === "in_progress" ||
    value === "completed" ||
    value === "overdue"
  ) {
    return value;
  }

  return "pending";
}

function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) {
    return false;
  }

  const due = new Date(dueDate);
  const now = new Date();

  const difference =
    due.getTime() - now.getTime();

  const hours =
    difference / (1000 * 60 * 60);

  return hours >= 0 && hours <= DUE_SOON_HOURS;
}

function isPastDue(dueDate: string | null): boolean {
  if (!dueDate) {
    return false;
  }

  return new Date(dueDate).getTime() < Date.now();
}

export async function getAssignmentData(
  userId: string,
): Promise<AssignmentData> {
  const supabase = await createClient();

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select("id, semester_id")
      .eq("profile_id", userId)
      .single();

  if (studentError || !student) {
    throw new Error(
      "Unable to load your student information.",
    );
  }

  const { data: studentSubjects, error: subjectsError } =
    await supabase
      .from("student_subjects")
      .select("subject_id")
      .eq("student_id", student.id);

  if (subjectsError) {
    throw new Error(
      "Unable to load your enrolled subjects.",
    );
  }

  const subjectIds = [
    ...new Set(
      (studentSubjects ?? []).map(
        (item) => item.subject_id,
      ),
    ),
  ];

  if (subjectIds.length === 0) {
    return {
      assignments: [],
      stats: {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        dueSoon: 0,
      },
    };
  }

  const { data: assignmentRows, error: assignmentError } =
    await supabase
      .from("assignments")
      .select(
        `
        id,
        subject_id,
        faculty_id,
        title,
        description,
        due_date,
        priority,
        attachment_url,
        created_at,
        updated_at
        `,
      )
      .in("subject_id", subjectIds)
      .order("due_date", {
        ascending: true,
        nullsFirst: false,
      });

  if (assignmentError) {
    throw new Error(
      "Unable to load your assignments.",
    );
  }

  const assignmentIds = [
    ...new Set(
      (assignmentRows ?? []).map(
        (assignment) => assignment.id,
      ),
    ),
  ];

  const { data: statusRows, error: statusError } =
    assignmentIds.length > 0
      ? await supabase
          .from("assignment_status")
          .select(
            "assignment_id, status, completed_at, notes",
          )
          .eq("student_id", student.id)
          .in("assignment_id", assignmentIds)
      : {
          data: [],
          error: null,
        };

  if (statusError) {
    throw new Error(
      "Unable to load assignment progress.",
    );
  }

  const subjectIdsForAssignments = [
    ...new Set(
      (assignmentRows ?? []).map(
        (assignment) => assignment.subject_id,
      ),
    ),
  ];

  const { data: subjectRows, error: subjectError } =
    subjectIdsForAssignments.length > 0
      ? await supabase
          .from("subjects")
          .select("id, code, name")
          .in(
            "id",
            subjectIdsForAssignments,
          )
      : {
          data: [],
          error: null,
        };

  if (subjectError) {
    throw new Error(
      "Unable to load assignment subjects.",
    );
  }

  const subjectMap = new Map(
    (subjectRows ?? []).map((subject) => [
      subject.id,
      {
        code: subject.code,
        name: subject.name,
      },
    ]),
  );

  const statusMap = new Map(
    (statusRows ?? []).map((status) => [
      status.assignment_id,
      {
        status: mapStatus(status.status),
        completedAt: status.completed_at,
        notes: status.notes,
      },
    ]),
  );

  const assignments: Assignment[] =
    (assignmentRows ?? []).map((row) => {
      const subject = subjectMap.get(
        row.subject_id,
      );

      const savedStatus = statusMap.get(
        row.id,
      );

      const rawStatus =
        savedStatus?.status ?? "pending";

      const overdue =
        rawStatus !== "completed" &&
        isPastDue(row.due_date);

      const finalStatus: AssignmentStatus =
        overdue
          ? "overdue"
          : rawStatus;

      return {
        id: row.id,

        subjectId: row.subject_id,
        subjectCode:
          subject?.code ?? "Unknown",
        subjectName:
          subject?.name ?? "Unknown subject",

        facultyId: row.faculty_id,

        title: row.title,
        description: row.description,

        dueDate: row.due_date,

        priority: mapPriority(
          row.priority,
        ),

        attachmentUrl:
          row.attachment_url,

        createdAt: row.created_at,
        updatedAt: row.updated_at,

        status: finalStatus,

        studentNotes:
          savedStatus?.notes ?? null,

        completedAt:
          savedStatus?.completedAt ??
          null,

        isOverdue: overdue,

        isDueSoon:
          !overdue &&
          rawStatus !== "completed" &&
          isDueSoon(row.due_date),
      };
    });

  const stats = {
    total: assignments.length,

    pending: assignments.filter(
      (assignment) =>
        assignment.status === "pending",
    ).length,

    inProgress: assignments.filter(
      (assignment) =>
        assignment.status ===
        "in_progress",
    ).length,

    completed: assignments.filter(
      (assignment) =>
        assignment.status === "completed",
    ).length,

    overdue: assignments.filter(
      (assignment) =>
        assignment.status === "overdue",
    ).length,

    dueSoon: assignments.filter(
      (assignment) =>
        assignment.isDueSoon,
    ).length,
  };

  return {
    assignments,
    stats,
  };
}