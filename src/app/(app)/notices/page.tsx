import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NoticesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Notices
        </h1>

        <p className="mt-2 text-slate-500">
          Stay updated with important campus and academic notices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notices module</CardTitle>

          <CardDescription>
            This module will be implemented in a future CampusMate phase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600">
            The UI foundation is ready for university notices, department
            announcements, exam updates, deadlines, and important alerts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}