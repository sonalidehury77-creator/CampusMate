import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TimetablePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Timetable
        </h1>

        <p className="mt-2 text-slate-500">
          View and manage your class schedule from one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timetable module</CardTitle>

          <CardDescription>
            This module will be implemented in a future CampusMate phase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600">
            The UI foundation is ready for class schedules, subjects,
            faculty, rooms, and timetable management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}