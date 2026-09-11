import { AssignmentCard } from "@/components/assignments/assignment-card";
import type { Assignment } from "@/types/assignments";

type AssignmentListProps = {
  assignments: Assignment[];
};

export function AssignmentList({
  assignments,
}: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-lg font-semibold">
          No assignments found
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Your current assignment list is empty.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
        />
      ))}
    </div>
  );
}