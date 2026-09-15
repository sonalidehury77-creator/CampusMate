import { createClient } from "@/lib/supabase/server";

import type {
  StudyPlannerData,
} from "@/types/study-planner";

export async function getStudyPlannerData(): Promise<StudyPlannerData> {
  const supabase = await createClient();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  /*
   * IMPORTANT:
   *
   * The queries in this service must use the exact columns
   * present in src/types/database.types.ts.
   *
   * We deliberately do not use guessed nested relationships.
   *
   * The same approach was used successfully for Attendance
   * and Resources.
   */

  // These will be populated from the verified database schema.

  return {
    plans: [],
    tasks: [],
    focusSessions: [],
    subjects: [],
    units: [],

    summary: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      todayTasks: 0,
      todayCompleted: 0,
      totalFocusMinutes: 0,
      weeklyFocusMinutes: 0,
    },
  };
}