export type ResourceType =
  | "pdf"
  | "image"
  | "document"
  | "link"
  | "note"
  | "pyq"
  | "other";

export type ResourceVisibility =
  | "private"
  | "students"
  | "faculty"
  | "public";

export type ResourceSubject = {
  id: string;
  code: string;
  name: string;
};

export type ResourceUnit = {
  id: string;
  subjectId: string;
  unitNumber: number;
  title: string;
};

export type ResourceFilterSubject = {
  id: string;
  code: string;
  name: string;
};

export type ResourceFilterUnit = {
  id: string;
  subjectId: string;
  unitNumber: number;
  title: string;
};

export type ResourceFilterOptions = {
  subjects: ResourceFilterSubject[];
  units: ResourceFilterUnit[];
};

export type AcademicResource = {
  id: string;
  subjectId: string | null;
  unitId: string | null;
  uploadedBy: string | null;
  title: string;
  description: string | null;
  resourceType: ResourceType;
  storagePath: string | null;
  externalUrl: string | null;
  visibility: ResourceVisibility;
  createdAt: string;
  subject: ResourceSubject | null;
  unit: ResourceUnit | null;
  uploaderName: string | null;
  signedUrl: string | null;
};

export type StudentNote = {
  id: string;
  subjectId: string | null;
  unitId: string | null;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  subject: ResourceSubject | null;
  unit: ResourceUnit | null;
};

export type ResourcesData = {
  resources: AcademicResource[];
  notes: StudentNote[];
  filters: ResourceFilterOptions;
};

export type ResourceFormData = {
  title: string;
  description: string;
  subjectId: string;
  unitId: string;
  resourceType: ResourceType;
  externalUrl: string;
  visibility: ResourceVisibility;
};

export type NoteFormData = {
  title: string;
  content: string;
  subjectId: string;
  unitId: string;
};