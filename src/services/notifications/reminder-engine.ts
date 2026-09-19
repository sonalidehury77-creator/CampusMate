import { createClient } from "@/lib/supabase/server";

export type ReminderEngineResult = {
  created: number;
};

export async function generateMySmartReminders(): Promise<ReminderEngineResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      `Failed to verify authentication: ${userError.message}`,
    );
  }

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const { data, error } = await supabase.rpc(
    "generate_my_smart_reminders",
  );

  if (error) {
    throw new Error(
      `Failed to generate smart reminders: ${error.message}`,
    );
  }

  return {
    created: Number(data ?? 0),
  };
}