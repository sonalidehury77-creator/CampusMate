export type FacultySubject = {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  academicYear: string;
  studentCount: number;
  assignmentCount: number;
  attendanceSessionCount: number;
};

export type FacultyClass = {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  semesterId: string;
};

export type FacultyAssignment = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  createdAt: string;
};

export type FacultyAttendanceSession = {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  sessionDate: string;
  studentCount: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
};

export type FacultyDashboardMetric = {
  value: number;
  label: string;
  description: string;
};

export type FacultyRisk = {
  key: string;
  level: "low" | "moderate" | "high" | "critical";
  title: string;
  description: string;
  recommendedAction: string;
};

export type FacultyInsight = {
  type: "positive" | "warning" | "action" | "info";
  title: string;
  description: string;
  href?: string;
};

export type FacultyIntelligence = {
  workloadScore: number;
  engagementScore: number;
  attendanceActivityScore: number;
  assignmentActivityScore: number;
  overallScore: number;

  metrics: {
    assignedSubjects: number;
    totalStudents: number;
    totalAssignments: number;
    upcomingAssignments: number;
    attendanceSessions: number;
    classesThisWeek: number;
  };

  risks: FacultyRisk[];
  insights: FacultyInsight[];

  generatedAt: string;
};

export type FacultyDashboardData = {
  faculty: {
    id: string;
    employeeNumber: string;
    designation: string | null;
    name: string;
    email: string;
  };

  subjects: FacultySubject[];

  todayClasses: FacultyClass[];

  upcomingClasses: FacultyClass[];

  assignments: FacultyAssignment[];

  attendanceSessions: FacultyAttendanceSession[];

  intelligence: FacultyIntelligence;

  generatedAt: string;
};