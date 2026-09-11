export type AttendanceStatus =
  | "present"
  | "absent"
  | "excused";

export type AttendanceSummary = {
  presentClasses: number;
  absentClasses: number;
  totalClasses: number;
  percentage: number;
  requiredPercentage: number;
  classesCanMiss: number;
  classesRequiredToReachTarget: number;
  isSafe: boolean;
  isAtRisk: boolean;
};

export type AttendanceRecord = {
  id: string;
  sessionId: string;
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
  presentClasses: number;
  absentClasses: number;
  totalClasses: number;
  percentage: number;
  requiredPercentage: number;
  classesCanMiss: number;
  classesRequiredToReachTarget: number;
  isSafe: boolean;
  isAtRisk: boolean;
};

export type AttendanceData = {
  summary: AttendanceSummary;
  subjects: SubjectAttendance[];
  recentRecords: AttendanceRecord[];
};