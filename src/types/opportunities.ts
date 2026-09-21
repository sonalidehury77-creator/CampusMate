export type OpportunityType =
  | "scholarship"
  | "internship"
  | "hackathon"
  | "competition"
  | "workshop"
  | "certification"
  | "placement"
  | "government"
  | "fellowship"
  | "research"
  | "other";

export type OpportunityStatus =
  | "draft"
  | "published"
  | "closed"
  | "archived";

export type OpportunityApplicationStatus =
  | "saved"
  | "applied"
  | "shortlisted"
  | "selected"
  | "rejected"
  | "withdrawn";

export type OpportunityMode =
  | "online"
  | "offline"
  | "hybrid";

export type Opportunity = {
  id: string;
  title: string;
  description: string | null;

  opportunityType: OpportunityType;

  providerName: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  applicationUrl: string | null;

  eligibility: string | null;
  requiredDocuments: string[];

  organizationType: string | null;
  industry: string | null;
  location: string | null;
  mode: OpportunityMode | null;

  amount: number | null;
  currency: string;

  deadline: string | null;
  startsAt: string | null;
  endsAt: string | null;

  tags: string[];

  isVerified: boolean;
  isFeatured: boolean;

  status: OpportunityStatus;

  academicYear: string | null;
};

export type OpportunityApplication = {
  id: string;
  opportunityId: string;
  studentId: string;

  status: OpportunityApplicationStatus;

  appliedAt: string | null;
  notes: string | null;

  completedDocuments: string[];

  reminderAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type OpportunityMatch = {
  opportunity: Opportunity;
  application: OpportunityApplication | null;
  matchScore: number;
  matchReasons: string[];
  daysRemaining: number | null;
};

export type OpportunitySummary = {
  total: number;
  scholarships: number;
  internships: number;
  other: number;
  saved: number;
  applied: number;
  upcomingDeadlines: number;
};

export type OpportunitiesData = {
  opportunities: OpportunityMatch[];
  summary: OpportunitySummary;
};