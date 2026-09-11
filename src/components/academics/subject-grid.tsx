import { SubjectCard } from "@/components/academics/subject-card";
import { EmptyState } from "@/components/ui/empty-state";

type Subject = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number | null;
  progress: number;
};

type SubjectGridProps = {
  subjects: Subject[];
};

export function SubjectGrid({
  subjects,
}: SubjectGridProps) {
  if (subjects.length === 0) {
    return (
      <EmptyState
        title="No subjects found"
        description="No subjects are currently configured for your semester."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          {...subject}
        />
      ))}
    </div>
  );
}