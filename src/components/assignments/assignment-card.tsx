import { Card } from "@/components/ui/card";
import { AssignmentStatusControl } from "@/components/assignments/assignment-status-control";
import type {
  Assignment,
  AssignmentPriority,
} from "@/types/assignments";

type AssignmentCardProps = {
  assignment: Assignment;
};

function formatDueDate(
  dueDate: string | null,
) {
  if (!dueDate) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    },
  ).format(new Date(dueDate));
}

function getPriorityLabel(
  priority: AssignmentPriority,
) {
  switch (priority) {
    case "urgent":
      return "Urgent";

    case "high":
      return "High";

    case "low":
      return "Low";

    default:
      return "Medium";
  }
}

function getPriorityClass(
  priority: AssignmentPriority,
) {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-700";

    case "high":
      return "bg-orange-100 text-orange-700";

    case "low":
      return "bg-slate-100 text-slate-700";

    default:
      return "bg-blue-100 text-blue-700";
  }
}

function getStatusClass(
  status: Assignment["status"],
) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";

    case "in_progress":
      return "bg-blue-100 text-blue-700";

    case "overdue":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getStatusLabel(
  status: Assignment["status"],
) {
  switch (status) {
    case "completed":
      return "Completed";

    case "in_progress":
      return "In progress";

    case "overdue":
      return "Overdue";

    default:
      return "Pending";
  }
}

export function AssignmentCard({
  assignment,
}: AssignmentCardProps) {
  return (
    <Card
      className={`space-y-5 ${
        assignment.isOverdue
          ? "border-red-300"
          : assignment.isDueSoon
            ? "border-orange-300"
            : ""
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {assignment.subjectCode}
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            {assignment.title}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {assignment.subjectName}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
              assignment.priority,
            )}`}
          >
            {getPriorityLabel(
              assignment.priority,
            )}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
              assignment.status,
            )}`}
          >
            {getStatusLabel(
              assignment.status,
            )}
          </span>
        </div>
      </div>

      {assignment.description && (
        <p className="text-sm leading-6 text-muted-foreground">
          {assignment.description}
        </p>
      )}

      <div className="grid gap-4 border-y border-border py-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">
            Deadline
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${
              assignment.isOverdue
                ? "text-red-600"
                : assignment.isDueSoon
                  ? "text-orange-600"
                  : ""
            }`}
          >
            {formatDueDate(
              assignment.dueDate,
            )}
          </p>

          {assignment.isOverdue && (
            <p className="mt-1 text-xs font-medium text-red-600">
              Deadline has passed.
            </p>
          )}

          {assignment.isDueSoon &&
            !assignment.isOverdue && (
              <p className="mt-1 text-xs font-medium text-orange-600">
                Due within 48 hours.
              </p>
            )}
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Assignment created
          </p>

          <p className="mt-1 text-sm font-semibold">
            {new Intl.DateTimeFormat(
              "en-IN",
              {
                dateStyle: "medium",
                timeZone:
                  "Asia/Kolkata",
              },
            ).format(
              new Date(
                assignment.createdAt,
              ),
            )}
          </p>
        </div>
      </div>

      {assignment.attachmentUrl && (
        <a
          href={assignment.attachmentUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-medium text-brand-600 hover:underline"
        >
          Open assignment attachment
        </a>
      )}

      <AssignmentStatusControl
        assignmentId={assignment.id}
        status={assignment.status}
        notes={assignment.studentNotes}
      />
    </Card>
  );
}