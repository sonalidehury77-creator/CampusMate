export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

export type AttendanceRiskLevel =
  | "healthy"
  | "at-risk"
  | "shortage"
  | "critical";

export type AttendancePolicy = {
  id: string;
  subjectId: string;
  requiredPercentage: number;
  warningMargin: number;
  enabled: boolean;
};

export type AttendanceRecord = {
  id: string;
  sessionId: string;
  studentId: string;

  subjectId: string;
  subjectCode: string;
  subjectName: string;

  sessionDate: string;

  startTime: string | null;
  endTime: string | null;
  room: string | null;

  status: AttendanceStatus;
};

export type SubjectAttendance = {
  subjectId: string;
  subjectCode: string;
  subjectName: string;

  attendedClasses: number;

  presentClasses: number;
  lateClasses: number;

  countedClasses: number;

  absentClasses: number;
  excusedClasses: number;

  totalClasses: number;

  percentage: number;
  attendancePercentage: number;

  requiredPercentage: number;

  classesCanMiss: number;
  classesRequiredToReachTarget: number;

  isBelowRequired: boolean;
  isAtRisk: boolean;
  isSafe: boolean;

  riskLevel: AttendanceRiskLevel;
};

export type MonthlyAttendance = {
  month: string;
  label: string;

  attendedClasses: number;
  countedClasses: number;

  percentage: number;
};

export type AttendanceTrendPoint = {
  month: string;
  monthLabel: string;

  attendedClasses: number;
  countedClasses: number;

  attendancePercentage: number;
};

export type AttendanceCalendarDay = {
  date: string;

  status:
    | AttendanceStatus
    | "no_class";

  subjectCode?: string;
  subjectName?: string;

  presentClasses?: number;
  lateClasses?: number;
  absentClasses?: number;
  excusedClasses?: number;

  countedClasses?: number;
  attendancePercentage?: number | null;
};

export type AttendancePrediction = {
  currentPercentage: number;
  projectedPercentage: number;

  windowDays: number;
  futureClasses: number;

  recentAttendanceRate: number;

  projectedStatus:
    | "safe"
    | "warning"
    | "risk";

  explanation: string;
};

export type AttendanceOverall = {
  attendedClasses: number;

  presentClasses: number;
  lateClasses: number;

  countedClasses: number;

  absentClasses: number;
  excusedClasses: number;

  totalClasses: number;

  percentage: number;

  requiredPercentage: number;

  classesCanMiss: number;
  classesRequiredToReachTarget: number;

  isBelowRequired: boolean;
  isAtRisk: boolean;
  isSafe: boolean;

  riskLevel: AttendanceRiskLevel;
};

export type AttendanceSummary = {
  attendedClasses: number;

  presentClasses: number;
  lateClasses: number;

  countedClasses: number;

  absentClasses: number;
  excusedClasses: number;

  totalClasses: number;

  percentage: number;

  requiredPercentage: number;

  classesCanMiss: number;
  classesRequiredToReachTarget: number;

  isAtRisk: boolean;
  isSafe: boolean;

  riskLevel: AttendanceRiskLevel;
};

export type AttendanceData = {
  summary: AttendanceSummary;

  subjects: SubjectAttendance[];

  recentRecords: AttendanceRecord[];
};

export type StudentAttendanceData = {
  overall: AttendanceOverall;

  subjects: SubjectAttendance[];

  monthlyTrend: MonthlyAttendance[];

  calendar: AttendanceCalendarDay[];

  recentRecords: AttendanceRecord[];

  prediction: AttendancePrediction;
};