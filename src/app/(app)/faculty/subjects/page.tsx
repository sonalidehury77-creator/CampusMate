import { Card } from "@/components/ui/card";

import { getFacultySubjects } from "@/services/faculty/faculty-data";

export default async function FacultySubjectsPage() {
  const subjects =
    await getFacultySubjects();

  return (
    <div className="space-y-8">
      <PageTitle
        title="My Subjects"
        description="Subjects currently assigned to you."
      />

      {subjects.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No subjects have been assigned to your faculty account yet.
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map(
            (subject) => (
              <Card
                key={subject.id}
                className="p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">
                      {subject.name}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {subject.code}
                    </p>
                  </div>

                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                    Assigned
                  </span>
                </div>

                <div className="mt-6 border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    Academic Year
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {subject.academicYear}
                  </p>
                </div>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}


function PageTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-brand-600">
        Teaching
      </p>

      <h1 className="mt-2 text-3xl font-bold">
        {title}
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}