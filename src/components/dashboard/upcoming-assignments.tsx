type AssignmentItem = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
};

type UpcomingAssignmentsProps = {
  assignments: AssignmentItem[];
};

export function UpcomingAssignments({
  assignments,
}: UpcomingAssignmentsProps) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="text-lg font-semibold text-foreground">
          Upcoming assignments
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Keep track of what needs to be submitted.
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="p-5">
          <p className="text-sm text-muted-foreground">
            No upcoming assignments.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="p-5"
            >
              <p className="font-medium text-foreground">
                {assignment.title}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {assignment.subject}
              </p>

              <p className="mt-3 text-xs font-medium text-brand-600">
                Due {assignment.dueDate}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}