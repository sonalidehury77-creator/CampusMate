export type AcademicProfile = {
  fullName: string;
  email: string | null;
  studentNumber: string;
  enrollmentYear: number | null;
  currentSemester: number | null;

  department: {
    id: string;
    name: string;
    code: string;
  } | null;

  program: {
    id: string;
    name: string;
    code: string;
    duration: number | null;
  } | null;

  semester: {
    id: string;
    semesterNumber: number;
    academicYear: string;
  } | null;
};

export type AcademicSubject = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number | null;
  progress: number;
  isEnrolled: boolean;
};

export type SyllabusTopic = {
  id: string;
  title: string;
  description: string | null;
  sequenceNumber: number;
};

export type SyllabusUnit = {
  id: string;
  unitNumber: number;
  title: string;
  description: string | null;
  progress: number;
  completed: boolean;
  topics: SyllabusTopic[];
};

export type AcademicSubjectDetails = {
  subject: AcademicSubject;
  units: SyllabusUnit[];
};

export type AcademicData = {
  profile: AcademicProfile;
  subjects: AcademicSubject[];
  overallProgress: number;
  totalCredits: number;
  completedSubjects: number;
  needsAttentionSubjects: number;
};