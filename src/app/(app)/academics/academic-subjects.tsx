"use client";

import { useMemo, useState } from "react";

import { SubjectCard } from "@/components/academics/subject-card";

type Topic = {
  id: string;
  title: string;
  description: string | null;
  sequence_number: number;
};

type Unit = {
  id: string;
  unit_number: number;
  title: string;
  description: string | null;
  progress: number;
  completed: boolean;
  topics: Topic[];
};

type Subject = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  credits: number | null;
  progress: number;
  units: Unit[];
};

type AcademicSubjectsProps = {
  subjects: Subject[];
};

export function AcademicSubjects({
  subjects,
}: AcademicSubjectsProps) {
  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      "all" | "in-progress" | "completed"
    >("all");

  const filteredSubjects = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return subjects.filter((subject) => {
      const matchesSearch =
        query.length === 0 ||
        subject.name
          .toLowerCase()
          .includes(query) ||
        subject.code
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "completed" &&
          subject.progress >= 100) ||
        (filter === "in-progress" &&
          subject.progress < 100);

      return matchesSearch && matchesFilter;
    });
  }, [subjects, search, filter]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            My subjects
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Track your syllabus and subject progress.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search subjects..."
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as
                  | "all"
                  | "in-progress"
                  | "completed",
              )
            }
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">
              All subjects
            </option>

            <option value="in-progress">
              In progress
            </option>

            <option value="completed">
              Completed
            </option>
          </select>
        </div>
      </div>

      {filteredSubjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="font-medium text-foreground">
            No subjects found
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              {...subject}
            />
          ))}
        </div>
      )}
    </section>
  );
}