import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          AI
        </h1>

        <p className="mt-2 text-slate-500">
          Get intelligent academic assistance through CampusMate AI.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI module</CardTitle>

          <CardDescription>
            This module will be implemented in a future CampusMate phase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-600">
            The UI foundation is ready for AI study assistance, question
            answering, summaries, personalized study plans, and academic
            recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}