import { Card } from "@/components/ui/card";

import {
  getFacultyDashboardData,
} from "@/services/faculty/faculty-data";

import {
  getFacultyIntelligence,
} from "@/services/faculty/faculty-intelligence";

export default async function FacultyAnalyticsPage() {
  const [
    dashboard,
    intelligence,
  ] = await Promise.all([
    getFacultyDashboardData(),
    getFacultyIntelligence(),
  ]);

  const totalAssignments =
    dashboard.assignments.length;

  const totalSubmissions =
    dashboard.assignments.reduce(
      (total, assignment) =>
        total +
        assignment.submissionCount,
      0,
    );

  const totalGraded =
    dashboard.assignments.reduce(
      (total, assignment) =>
        total +
        assignment.gradedCount,
      0,
    );

  const gradingRate =
    totalSubmissions > 0
      ? (
          (totalGraded /
            totalSubmissions) *
          100
        ).toFixed(1)
      : "0.0";

  const highRisk =
    intelligence.atRiskStudents.filter(
      (student) =>
        student.riskLevel ===
        "high",
    ).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Analytics
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Teaching Analytics
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Operational and academic insights from your teaching activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Subjects"
          value={
            dashboard.subjects.length
          }
        />

        <Metric
          label="Students"
          value={
            dashboard.students.length
          }
        />

        <Metric
          label="Assignments"
          value={
            totalAssignments
          }
        />

        <Metric
          label="Submission Grading"
          value={`${gradingRate}%`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">
            Submission Performance
          </h2>

          <div className="mt-6 space-y-5">
            <Progress
              label="Submitted"
              value={
                totalSubmissions
              }
              max={
                Math.max(
                  totalSubmissions,
                  1,
                )
              }
            />

            <Progress
              label="Graded"
              value={
                totalGraded
              }
              max={
                Math.max(
                  totalSubmissions,
                  1,
                )
              }
            />

            <Progress
              label="Pending"
              value={
                totalSubmissions -
                totalGraded
              }
              max={
                Math.max(
                  totalSubmissions,
                  1,
                )
              }
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">
            Student Risk Overview
          </h2>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <RiskCard
              label="High"
              value={
                highRisk
              }
            />

            <RiskCard
              label="Medium"
              value={
                intelligence.atRiskStudents.filter(
                  (student) =>
                    student.riskLevel ===
                    "medium",
                ).length
              }
            />

            <RiskCard
              label="Low"
              value={
                intelligence.atRiskStudents.filter(
                  (student) =>
                    student.riskLevel ===
                    "low",
                ).length
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
}


function Metric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </Card>
  );
}


function Progress({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percentage =
    Math.min(
      100,
      Math.round(
        (value / max) *
          100,
      ),
    );

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>

        <span className="font-semibold">
          {value}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}


function RiskCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border p-4 text-center">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}