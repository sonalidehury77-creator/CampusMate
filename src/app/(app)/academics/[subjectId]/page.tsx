import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  SubjectProgressForm,
  UnitProgressForm,
} from "@/components/academics/progress-form";
import { ProgressBar } from "@/components/academics/progress-bar";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { getAcademicSubjectDetails } from "@/services/academics/academic-data";

type SubjectPageProps = {
  params: Promise<{
    subjectId: string;
  }>;
};

export default async function SubjectPage({
  params,
}: SubjectPageProps) {
  const { subjectId } = await params;

  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const claims = claimsError
    ? null
    : claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  let data;

  try {
    data =
      await getAcademicSubjectDetails(
        claims.sub,
        subjectId,
      );
  } catch {
    notFound();
  }

  const completedUnits = data.units.filter(
    (unit) => unit.completed,
  ).length;

  return (
    <main className="space-y-8">
      <Link
        href="/academics"
        className="inline-flex text-sm font-medium text-brand-600 hover:underline"
      >
        ← Back to academics
      </Link>

      <PageHeader
        eyebrow={data.subject.code}
        title={data.subject.name}
        description={
          data.subject.description ??
          "Manage your syllabus and study progress."
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Subject progress
              </p>

              <p className="mt-1 text-3xl font-bold">
                {Math.round(
                  data.subject.progress,
                )}
                %
              </p>
            </div>

            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {data.subject.credits ?? "—"}{" "}
              credits
            </span>
          </div>

          <ProgressBar
            value={data.subject.progress}
          />

          <SubjectProgressForm
            subjectId={data.subject.id}
            currentProgress={
              data.subject.progress
            }
          />
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">
            Syllabus coverage
          </p>

          <p className="mt-1 text-3xl font-bold">
            {completedUnits}/
            {data.units.length}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Units completed
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Syllabus
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Work through units and topics and keep
            your progress updated.
          </p>
        </div>

        <div className="space-y-4">
          {data.units.map((unit) => (
            <Card
              key={unit.id}
              className="space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
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

                <span className="text-sm font-semibold">
                  {Math.round(unit.progress)}%
                </span>
              </div>

              <ProgressBar
                value={unit.progress}
              />

              <div>
                <p className="mb-3 text-sm font-semibold">
                  Topics
                </p>

                {unit.topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No topics configured.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {unit.topics.map(
                      (topic) => (
                        <div
                          key={topic.id}
                          className="rounded-xl bg-muted/50 p-3"
                        >
                          <p className="text-sm font-medium">
                            {
                              topic.sequenceNumber
                            }
                            . {topic.title}
                          </p>

                          {topic.description && (
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {
                                topic.description
                              }
                            </p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              <UnitProgressForm
                subjectId={
                  data.subject.id
                }
                unitNumber={
                  unit.unitNumber
                }
                currentProgress={
                  unit.progress
                }
                completed={
                  unit.completed
                }
              />
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}