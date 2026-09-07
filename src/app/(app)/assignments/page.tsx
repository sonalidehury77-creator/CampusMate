import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Assignments
        </h1>

        <p className="mt-2 text-slate-500">
          Track and manage your assignments from one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignments module</CardTitle>

          <CardDescription>
            This module will be implemented in a future CampusMate phase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600">
            The UI foundation is ready for assignment deadlines, subjects,
            submission status, priorities, and academic task tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}