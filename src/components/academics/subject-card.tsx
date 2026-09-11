import Link from "next/link";

import { ProgressBar } from "@/components/academics/progress-bar";
import { Card } from "@/components/ui/card";

type SubjectCardProps = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number | null;
  progress: number;
};

export function SubjectCard({
  id,
  code,
  name,
  description,
  credits,
  progress,
}: SubjectCardProps) {
  const status =
    progress >= 100
      ? "Completed"
      : progress >= 75
        ? "On track"
        : progress >= 50
          ? "In progress"
          : "Needs attention";

  return (
    <Link href={`/academics/${id}`}>
      <Card className="h-full cursor-pointer space-y-4 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              {code}
            </p>

            <h3 className="mt-1 text-lg font-semibold text-foreground">
              {name}
            </h3>
          </div>

          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            {credits ?? "—"} credits
          </span>
        </div>

        <p className="min-h-10 text-sm leading-5 text-muted-foreground">
          {description ||
            "No subject description available yet."}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Progress
            </span>

            <span className="font-semibold text-foreground">
              {Math.round(progress)}%
            </span>
          </div>

          <ProgressBar value={progress} />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">
            {status}
          </span>

          <span className="font-medium text-brand-600">
            View syllabus →
          </span>
        </div>
      </Card>
    </Link>
  );
}