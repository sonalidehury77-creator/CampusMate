import { Card } from "@/components/ui/card";

import type {
  StudyRecommendation,
} from "@/services/study-planner/study-recommendations";

type StudyRecommendationsProps = {
  recommendations: StudyRecommendation[];
};

export function StudyRecommendations({
  recommendations,
}: StudyRecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <h2 className="font-semibold">
          You&apos;re on track
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          There are no pending study tasks requiring attention.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div>
        <h2 className="font-semibold">
          CampusMate recommends
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Your next best study actions.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {recommendations.map(
          (recommendation) => (
            <div
              key={recommendation.title}
              className="rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">
                    {recommendation.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {recommendation.reason}
                  </p>
                </div>

                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {recommendation.durationMinutes} min
                </span>
              </div>
            </div>
          ),
        )}
      </div>
    </Card>
  );
}