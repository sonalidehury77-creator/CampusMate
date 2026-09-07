import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StudyPlannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Study Planner
        </h1>

        <p className="mt-2 text-slate-500">
          Plan, organize, and track your study activities from one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Study Planner module</CardTitle>

          <CardDescription>
            This module will be implemented in a future CampusMate phase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600">
            The UI foundation is ready for study plans, tasks, goals,
            schedules, progress tracking, and focused study sessions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}