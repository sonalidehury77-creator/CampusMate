import { ProgressBar } from "@/components/academics/progress-bar";
import { Card } from "@/components/ui/card";

type Topic = {
  id: string;
  title: string;
  description: string | null;
  sequenceNumber: number;
};

type Unit = {
  id: string;
  unitNumber: number;
  title: string;
  description: string | null;
  progress: number;
  completed: boolean;
  topics: Topic[];
};

type SyllabusListProps = {
  units: Unit[];
};

export function SyllabusList({
  units,
}: SyllabusListProps) {
  if (units.length === 0) {
    return (
      <Card>
        <p className="font-medium">
          Syllabus not available yet
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Units and topics have not been configured for
          this subject.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {units.map((unit) => (
        <Card
          key={unit.id}
          className="space-y-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                Unit {unit.unitNumber}
              </p>

              <h3 className="mt-1 text-lg font-semibold">
                {unit.title}
              </h3>

              {unit.description && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {unit.description}
                </p>
              )}
            </div>

            <div className="min-w-32">
              <div className="mb-2 flex justify-between text-xs">
                <span>Progress</span>

                <span className="font-semibold">
                  {Math.round(unit.progress)}%
                </span>
              </div>

              <ProgressBar value={unit.progress} />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-sm font-semibold">
              Topics
            </p>

            {unit.topics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No topics configured.
              </p>
            ) : (
              <ol className="space-y-2">
                {unit.topics.map((topic) => (
                  <li
                    key={topic.id}
                    className="rounded-xl bg-muted/50 p-3"
                  >
                    <div className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold">
                        {topic.sequenceNumber}
                      </span>

                      <div>
                        <p className="text-sm font-medium">
                          {topic.title}
                        </p>

                        {topic.description && (
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {topic.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}