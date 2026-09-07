import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Attendance
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor and manage your attendance from one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance module</CardTitle>

          <CardDescription>
            This module will be implemented in a future CampusMate phase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600">
            The UI foundation is ready for attendance records, subject-wise
            percentages, attendance history, and shortage alerts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}