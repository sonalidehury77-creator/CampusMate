"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const uuidSchema = z.string().uuid();

const focusSessionSchema = z.object({
  durationMinutes: z
    .number()
    .int()
    .min(1)
    .max(240),
  startedAt: z.string().datetime(),
  endedAt: z
    .string()
    .datetime()
    .nullable(),
  subjectId: z
    .string()
    .uuid()
    .nullable(),
});

export async function saveFocusSession(
  input: unknown,
) {
  const parsed =
    focusSessionSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      "Invalid focus session.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  /*
   * IMPORTANT:
   *
   * Insert only the columns that actually exist
   * in your generated focus_sessions Insert type.
   *
   * We will connect this after verifying that schema.
   */

  void uuidSchema;

  revalidatePath(
    "/study-planner",
  );

  revalidatePath(
    "/dashboard",
  );
}