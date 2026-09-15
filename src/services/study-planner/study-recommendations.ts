import type {
  StudyTask,
} from "@/types/study-planner";

export type StudyRecommendation = {
  title: string;
  reason: string;
  priority: "high" | "medium" | "normal";
  durationMinutes: number;
};

export function getStudyRecommendations(
  tasks: StudyTask[],
): StudyRecommendation[] {
  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status !== "completed",
    );

  return pendingTasks
    .sort((a, b) => {
      const priorityScore = {
        urgent: 4,
        high: 3,
        medium: 2,
        low: 1,
      };

      return (
        priorityScore[b.priority] -
        priorityScore[a.priority]
      );
    })
    .slice(0, 3)
    .map((task) => ({
      title: task.title,
      reason: task.subject
        ? `Recommended for ${task.subject.name}.`
        : "Recommended based on your pending study tasks.",
      priority:
        task.priority === "urgent" ||
        task.priority === "high"
          ? "high"
          : task.priority === "medium"
            ? "medium"
            : "normal",
      durationMinutes:
        task.durationMinutes,
    }));
}