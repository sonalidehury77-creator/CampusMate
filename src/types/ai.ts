export type AIConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type AIMessageRole =
  | "user"
  | "assistant"
  | "system";

export type AIMessage = {
  id: string;
  conversationId: string;
  role: AIMessageRole;
  content: string;
  createdAt: string;
};

export type AIConversationWithMessages =
  AIConversation & {
    messages: AIMessage[];
  };

export type AIContext = {
  student: {
    name: string;
    studentNumber: string;
    semester: number | null;
    academicYear: string | null;
    program: string | null;
    department: string | null;
  };

  subjects: {
    id: string;
    code: string;
    name: string;
    progress: number;
  }[];

  syllabus: {
    subjectCode: string;
    subjectName: string;
    unitNumber: number;
    unitTitle: string;
    progress: number;
    completed: boolean;
  }[];

  assignments: {
    id: string;
    title: string;
    subjectName: string;
    dueDate: string | null;
    priority: string;
  }[];

  attendance: {
    subjectCode: string;
    subjectName: string;
    percentage: number;
    present: number;
    total: number;
  }[];

  timetable: {
    subjectCode: string;
    subjectName: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string | null;
  }[];

  exams: {
    subjectCode: string;
    subjectName: string;
    examDate: string;
    examType: string;
    startTime: string | null;
    room: string | null;
  }[];

  studyTasks: {
    task: string;
    studyDate: string;
    durationMinutes: number;
    priority: string;
    status: string;
    subjectName: string | null;
  }[];

  focusSessions: {
    durationMinutes: number;
    sessionType: string;
    startedAt: string;
    subjectName: string | null;
  }[];

  notices: {
    title: string;
    category: string;
    priority: string;
    deadline: string | null;
  }[];
};

export type AIChatData = {
  conversations: AIConversation[];
  activeConversation: AIConversationWithMessages | null;
  context: AIContext;
};

export type AIQuickPrompt = {
  id: string;
  title: string;
  prompt: string;
  category:
    | "study"
    | "exam"
    | "assignment"
    | "attendance"
    | "planning"
    | "general";
};