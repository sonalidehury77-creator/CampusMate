"use client";

import { useMemo, useState } from "react";

import { NoticeCard } from "@/components/notices/notice-card";
import type {
  Notice,
  NoticeCategory,
  NoticePriority,
  NoticesData,
} from "@/types/notices";

type NoticesPageClientProps = {
  data: NoticesData;
};

export function NoticesPageClient({
  data,
}: NoticesPageClientProps) {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState<
      NoticeCategory | ""
    >("");

  const [priority, setPriority] =
    useState<
      NoticePriority | ""
    >("");

  const [deadline, setDeadline] =
    useState<
      "all" | "upcoming" | "overdue" | "none"
    >("all");

  const filteredNotices =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return data.notices.filter(
        (notice: Notice) => {
          const matchesSearch =
            !query ||
            notice.title
              .toLowerCase()
              .includes(query) ||
            notice.description
              ?.toLowerCase()
              .includes(query) ||
            notice.category
              .toLowerCase()
              .includes(query) ||
            notice.source
              ?.toLowerCase()
              .includes(query);

          const matchesCategory =
            !category ||
            notice.category ===
              category;

          const matchesPriority =
            !priority ||
            notice.priority ===
              priority;

          const matchesDeadline =
            deadline === "all" ||
            (deadline ===
              "upcoming" &&
              notice.isDeadlineSoon &&
              !notice.isOverdue) ||
            (deadline ===
              "overdue" &&
              notice.isOverdue) ||
            (deadline === "none" &&
              !notice.deadline);

          return (
            matchesSearch &&
            matchesCategory &&
            matchesPriority &&
            matchesDeadline
          );
        },
      );
    }, [
      data.notices,
      search,
      category,
      priority,
      deadline,
    ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_170px_180px]">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search notices..."
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
          />

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target
                  .value as NoticeCategory | "",
              )
            }
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">
              All categories
            </option>

            <option value="examination">
              Examination
            </option>

            <option value="assignment">
              Assignment
            </option>

            <option value="scholarship">
              Scholarship
            </option>

            <option value="placement">
              Placement
            </option>

            <option value="event">
              Event
            </option>

            <option value="holiday">
              Holiday
            </option>

            <option value="administrative">
              Administrative
            </option>

            <option value="academic">
              Academic
            </option>

            <option value="general">
              General
            </option>
          </select>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target
                  .value as NoticePriority | "",
              )
            }
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="">
              All priorities
            </option>

            <option value="urgent">
              Urgent
            </option>

            <option value="important">
              Important
            </option>

            <option value="normal">
              Normal
            </option>
          </select>

          <select
            value={deadline}
            onChange={(event) =>
              setDeadline(
                event.target.value as
                  | "all"
                  | "upcoming"
                  | "overdue"
                  | "none",
              )
            }
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="all">
              All deadlines
            </option>

            <option value="upcoming">
              Deadline soon
            </option>

            <option value="overdue">
              Overdue
            </option>

            <option value="none">
              No deadline
            </option>
          </select>
        </div>
      </div>

      {filteredNotices.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredNotices.map(
            (notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
              />
            ),
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <h2 className="text-lg font-semibold">
            No notices found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your search or
            filters.
          </p>
        </div>
      )}
    </div>
  );
}