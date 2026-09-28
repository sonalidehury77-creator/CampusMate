export const STORAGE_BUCKETS = {
  profileImages: "profile-images",
  studentDocuments: "student-documents",
  noticeAttachments: "notice-attachments",
  resourceFiles: "resource-files",
} as const;

export const STORAGE_LIMITS = {
  profileImageBytes: 2 * 1024 * 1024,
  studentDocumentBytes: 10 * 1024 * 1024,
  noticeAttachmentBytes: 20 * 1024 * 1024,
  resourceFileBytes: 25 * 1024 * 1024,
} as const;