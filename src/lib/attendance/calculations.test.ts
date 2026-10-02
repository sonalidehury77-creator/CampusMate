import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateAttendance,
} from "./calculations";

describe(
  "Attendance calculations",
  () => {
    it(
      "calculates 75% attendance correctly",
      () => {
        const result =
          calculateAttendance(
            [
              "present",
              "present",
              "present",
              "absent",
            ],
            75,
          );

        expect(
          result.percentage,
        ).toBe(75);

        expect(
          result.attendedClasses,
        ).toBe(3);

        expect(
          result.countedClasses,
        ).toBe(4);
      },
    );

    it(
      "counts late as attended",
      () => {
        const result =
          calculateAttendance(
            [
              "present",
              "late",
              "absent",
              "absent",
            ],
            75,
          );

        expect(
          result.attendedClasses,
        ).toBe(2);

        expect(
          result.countedClasses,
        ).toBe(4);

        expect(
          result.percentage,
        ).toBe(50);
      },
    );

    it(
      "does not count excused classes",
      () => {
        const result =
          calculateAttendance(
            [
              "present",
              "present",
              "absent",
              "excused",
            ],
            75,
          );

        expect(
          result.attendedClasses,
        ).toBe(2);

        expect(
          result.countedClasses,
        ).toBe(3);

        expect(
          result.excusedClasses,
        ).toBe(1);

        expect(
          result.percentage,
        ).toBeCloseTo(
          66.67,
          2,
        );
      },
    );

    it(
      "calculates required classes correctly",
      () => {
        const result =
          calculateAttendance(
            [
              ...Array(37).fill(
                "present",
              ),
              ...Array(13).fill(
                "absent",
              ),
            ],
            75,
          );

        expect(
          result.percentage,
        ).toBe(74);

        expect(
          result.classesRequiredToReachTarget,
        ).toBe(2);
      },
    );

    it(
      "calculates classes that can be missed",
      () => {
        const result =
          calculateAttendance(
            [
              ...Array(8).fill(
                "present",
              ),
              ...Array(2).fill(
                "absent",
              ),
            ],
            75,
          );

        expect(
          result.percentage,
        ).toBe(80);

        expect(
          result.classesCanMiss,
        ).toBe(0);
      },
    );

    it(
      "handles zero attendance records",
      () => {
        const result =
          calculateAttendance(
            [],
            75,
          );

        expect(
          result.percentage,
        ).toBe(0);

        expect(
          result.countedClasses,
        ).toBe(0);

        expect(
          result.classesRequiredToReachTarget,
        ).toBe(0);
      },
    );
  },
);