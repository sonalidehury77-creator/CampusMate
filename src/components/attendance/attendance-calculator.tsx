"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import type { AttendanceSummary } from "@/types/attendance";

type AttendanceCalculatorProps = {
  summary: AttendanceSummary;
};

function calculateFuturePercentage(
  present: number,
  total: number,
  futureClasses: number,
): number {
  if (total + futureClasses === 0) {
    return 0;
  }

  return Math.round(
    ((present + futureClasses) /
      (total + futureClasses)) *
      10000,
  ) / 100;
}

function calculateRequiredAttendance(
  present: number,
  total: number,
  target: number,
): number {
  const targetDecimal =
    target / 100;

  if (
    total === 0 ||
    present / total >=
      targetDecimal
  ) {
    return 0;
  }

  return Math.ceil(
    (targetDecimal * total -
      present) /
      (1 - targetDecimal),
  );
}

export function AttendanceCalculator({
  summary,
}: AttendanceCalculatorProps) {
  const [futureClasses, setFutureClasses] =
    useState(5);

  const futurePercentage =
    useMemo(
      () =>
        calculateFuturePercentage(
          summary.presentClasses,
          summary.totalClasses,
          futureClasses,
        ),
      [
        futureClasses,
        summary.presentClasses,
        summary.totalClasses,
      ],
    );

  const requiredClasses =
    calculateRequiredAttendance(
      summary.presentClasses,
      summary.totalClasses,
      summary.requiredPercentage,
    );

  const canMiss =
    summary.classesCanMiss;

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-600">
          Smart attendance calculator
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Plan your attendance
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Check how your attendance changes
          when you attend your upcoming
          classes.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Current attendance
          </p>

          <p className="mt-1 text-2xl font-bold">
            {summary.percentage}%
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {summary.presentClasses} present
            out of{" "}
            {summary.totalClasses}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Safe classes you can miss
          </p>

          <p className="mt-1 text-2xl font-bold">
            {canMiss}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            while maintaining{" "}
            {summary.requiredPercentage}%
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Classes needed to reach target
          </p>

          <p className="mt-1 text-2xl font-bold">
            {requiredClasses}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            consecutive classes attended
          </p>
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <label
          htmlFor="future-attendance-classes"
          className="text-sm font-medium"
        >
          If you attend the next{" "}
          {futureClasses} classes
        </label>

        <input
          id="future-attendance-classes"
          type="range"
          min="1"
          max="30"
          value={futureClasses}
          onChange={(event) =>
            setFutureClasses(
              Number(event.target.value),
            )
          }
          className="mt-4 w-full accent-brand-600"
        />

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            1 class
          </span>

          <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
            {futureClasses} classes
          </span>

          <span className="text-xs text-muted-foreground">
            30 classes
          </span>
        </div>

        <div className="mt-5 rounded-xl bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            Projected attendance
          </p>

          <p className="mt-1 text-2xl font-bold">
            {futurePercentage}%
          </p>

          <p
            className={`mt-1 text-sm font-medium ${
              futurePercentage >=
              summary.requiredPercentage
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {futurePercentage >=
            summary.requiredPercentage
              ? "You would remain above the required attendance."
              : "You would still be below the required attendance."}
          </p>
        </div>
      </div>
    </Card>
  );
}