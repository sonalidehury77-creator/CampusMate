import type { AIQuickPrompt } from "@/types/ai";

export const aiQuickPrompts: AIQuickPrompt[] = [
  {
    id: "today-plan",
    title: "Plan my day",
    prompt:
      "Based on my timetable, assignments, exams and study plan, create the best study schedule for today.",
    category: "planning",
  },

  {
    id: "exam-prep",
    title: "Prepare for my exams",
    prompt:
      "Look at my upcoming exams and syllabus progress. Tell me which subjects I should prioritize and why.",
    category: "exam",
  },

  {
    id: "weak-subject",
    title: "Find my weak subjects",
    prompt:
      "Analyze my subject progress and identify the subjects that need the most attention. Give me a practical improvement plan.",
    category: "study",
  },

  {
    id: "attendance",
    title: "Check my attendance",
    prompt:
      "Analyze my attendance subject by subject and tell me which subjects are at risk and what I should do.",
    category: "attendance",
  },

  {
    id: "assignments",
    title: "What should I do first?",
    prompt:
      "Look at my assignments and deadlines. Rank my work by urgency and explain what I should complete first.",
    category: "assignment",
  },

  {
    id: "study-plan",
    title: "Improve my study plan",
    prompt:
      "Review my current study plan and suggest specific improvements based on my exams, syllabus progress and available study time.",
    category: "planning",
  },

  {
    id: "revision",
    title: "Make a revision strategy",
    prompt:
      "Create a revision strategy for my current semester using my syllabus progress and upcoming exams.",
    category: "exam",
  },

  {
    id: "general",
    title: "Ask CampusMate",
    prompt:
      "Help me understand what I should focus on academically right now.",
    category: "general",
  },
];