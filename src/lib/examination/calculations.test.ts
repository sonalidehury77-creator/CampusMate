import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateAverage,
  calculateCoverage,
  calculateDaysRemaining,
  calculateExamPercentage,
  calculateReadiness,
  calculateRevisionPriority,
  calculateWeakTopic,
  getGradeFromPercentage,
} from "@/lib/examination/calculations";

describe(
  "examination calculations",
  () => {
    it(
      "calculates syllabus coverage",
      () => {
        expect(
          calculateCoverage(
            7,
            10,
          ),
        ).toBe(70);
      },
    );

    it(
      "returns zero coverage when there are no topics",
      () => {
        expect(
          calculateCoverage(
            0,
            0,
          ),
        ).toBe(0);
      },
    );

    it(
      "calculates average percentage",
      () => {
        expect(
          calculateAverage([
            70,
            80,
            90,
          ]),
        ).toBe(80);
      },
    );

    it(
      "returns null for empty average",
      () => {
        expect(
          calculateAverage([]),
        ).toBeNull();
      },
    );

    it(
      "detects weak topics",
      () => {
        expect(
          calculateWeakTopic(
            40,
            80,
          ),
        ).toBe(true);

        expect(
          calculateWeakTopic(
            80,
            80,
          ),
        ).toBe(false);
      },
    );

    it(
      "calculates revision priority",
      () => {
        expect(
          calculateRevisionPriority(
            30,
            30,
            2,
          ),
        ).toBe("critical");

        expect(
          calculateRevisionPriority(
            50,
            45,
            10,
          ),
        ).toBe("high");
      },
    );

    it(
      "calculates exam percentage",
      () => {
        expect(
          calculateExamPercentage(
            72,
            100,
          ),
        ).toBe(72);
      },
    );

    it(
      "handles missing exam marks",
      () => {
        expect(
          calculateExamPercentage(
            null,
            100,
          ),
        ).toBeNull();
      },
    );

    it(
      "calculates grades",
      () => {
        expect(
          getGradeFromPercentage(
            95,
          ),
        ).toBe("A+");

        expect(
          getGradeFromPercentage(
            82,
          ),
        ).toBe("A");

        expect(
          getGradeFromPercentage(
            35,
          ),
        ).toBe("F");
      },
    );

    it(
      "calculates readiness",
      () => {
        expect(
          calculateReadiness(
            0,
            0,
            10,
          ),
        ).toBe(
          "not_started",
        );

        expect(
          calculateReadiness(
            95,
            90,
            10,
          ),
        ).toBe(
          "ready",
        );
      },
    );

    it(
      "calculates exam days remaining",
      () => {
        const now =
          new Date(
            "2026-10-01T12:00:00",
          );

        expect(
          calculateDaysRemaining(
            "2026-10-05",
            now,
          ),
        ).toBe(5);
      },
    );
  },
);