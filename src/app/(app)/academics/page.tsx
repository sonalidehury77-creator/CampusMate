import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AcademicsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Academics
        </h1>

        <p className="mt-2 text-slate-500">
          Manage your academic information from one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academics module</CardTitle>

          <CardDescription>
            This module will be implemented in a future
            CampusMate phase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600">
            The UI foundation is ready for subjects,
            syllabus, faculty, progress, and academic
            analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}