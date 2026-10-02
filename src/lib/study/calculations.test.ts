import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateAttendanceRisk,
  calculateCompletionPercentage,
  calculateConfidenceGap,
  calculateCoverageGap,
  calculateDeadlineUrgency,
  calculateExamUrgency,
  calculateStudyEfficiency,
  calculateStudyPriorityScore,
  calculateWeaknessScore,
  getStudyPriority,
} from "./calculations";

describe(
  "smart study calculations",
  () => {
    it(
      "calculates exam urgency",
      () => {
        expect(
          calculateExamUrgency(2),
        ).toBe(100);

        expect(
          calculateExamUrgency(7),
        ).toBe(80);

        expect(
          calculateExamUrgency(60),
        ).toBe(10);
      },
    );

    it(
      "calculates deadline urgency",
      () => {
        expect(
          calculateDeadlineUrgency(0),
        ).toBe(100);

        expect(
          calculateDeadlineUrgency(3),
        ).toBe(90);

        expect(
          calculateDeadlineUrgency(30),
        ).toBe(25);
      },
    );

    it(
      "calculates coverage gap",
      () => {
        expect(
          calculateCoverageGap(60),
        ).toBe(40);

        expect(
          calculateCoverageGap(100),
        ).toBe(0);
      },
    );

    it(
      "calculates confidence gap",
      () => {
        expect(
          calculateConfidenceGap(50),
        ).toBe(30);

        expect(
          calculateConfidenceGap(90),
        ).toBe(0);
      },
    );

    it(
      "detects weak preparation",
      () => {
        expect(
          calculateWeaknessScore(
            30,
            30,
          ),
        ).toBeGreaterThan(60);
      },
    );

    it(
      "calculates attendance risk",
      () => {
        expect(
          calculateAttendanceRisk(45),
        ).toBe(100);

        expect(
          calculateAttendanceRisk(72),
        ).toBe(50);

        expect(
          calculateAttendanceRisk(85),
        ).toBe(0);
      },
    );

    it(
      "calculates priority score",
      () => {
        const score =
          calculateStudyPriorityScore(
            100,
            90,
            80,
            70,
            60,
            50,
            90,
          );

        expect(
          score,
        ).toBeGreaterThan(70);
      },
    );

    it(
      "maps score to critical priority",
      () => {
        expect(
          getStudyPriority(90),
        ).toBe("critical");
      },
    );

    it(
      "maps score to high priority",
      () => {
        expect(
          getStudyPriority(70),
        ).toBe("high");
      },
    );

    it(
      "maps score to medium priority",
      () => {
        expect(
          getStudyPriority(45),
        ).toBe("medium");
      },
    );

    it(
      "maps score to normal priority",
      () => {
        expect(
          getStudyPriority(20),
        ).toBe("normal");
      },
    );

    it(
      "calculates completion",
      () => {
        expect(
          calculateCompletionPercentage(
            45,
            60,
          ),
        ).toBe(75);
      },
    );

    it(
      "calculates study efficiency",
      () => {
        const efficiency =
          calculateStudyEfficiency(
            60,
            60,
            100,
          );

        expect(
          efficiency,
        ).toBe(100);
      },
    );
  },
);