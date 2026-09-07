import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Resources
        </h1>

        <p className="mt-2 text-slate-500">
          Access and organize your academic resources from one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resources module</CardTitle>

          <CardDescription>
            This module will be implemented in a future CampusMate phase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600">
            The UI foundation is ready for notes, study materials, PDFs,
            links, previous papers, and course resources.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}