import { PageHeader } from "@/components/layout/page-header";
import { AIChat } from "@/components/ai/ai-chat";
import { getAIData } from "@/services/ai/ai-data";
import { getAIContext } from "@/services/ai/ai-context";

export default async function AIPage() {
  const [data, context] =
    await Promise.all([
      getAIData(),
      getAIContext(),
    ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CampusMate intelligence"
        title="CampusMate AI"
        description="A context-aware academic assistant that understands your subjects, progress, assignments, attendance, timetable, exams and study workload."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            Subjects
          </p>
          <p className="mt-1 text-2xl font-bold">
            {context.subjects.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            Assignments
          </p>
          <p className="mt-1 text-2xl font-bold">
            {context.assignments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            Upcoming exams
          </p>
          <p className="mt-1 text-2xl font-bold">
            {context.exams.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            Study tasks
          </p>
          <p className="mt-1 text-2xl font-bold">
            {context.studyTasks.length}
          </p>
        </div>
      </div>

      <AIChat
        initialConversation={
          data.activeConversation
        }
      />
    </div>
  );
}