import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface FocusPageProps {
  params: Promise<{
    itemId: string;
  }>;
}

export default async function FocusPage({
  params,
}: FocusPageProps) {
  const {
    itemId,
  } = await params;

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const {
    data: student,
  } =
    await supabase
      .from("students")
      .select("id")
      .eq(
        "profile_id",
        user.id,
      )
      .maybeSingle();

  if (!student) {
    notFound();
  }

  const {
    data: item,
  } =
    await supabase
      .from(
        "smart_study_items",
      )
      .select("*")
      .eq(
        "id",
        itemId,
      )
      .eq(
        "student_id",
        student.id,
      )
      .maybeSingle();

  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">
          Focus Session
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {item.title}
        </h1>

        {item.description && (
          <p className="mt-2 text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>

      <div className="rounded-3xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Planned study time
        </p>

        <p className="mt-3 text-6xl font-bold">
          {item.planned_minutes}
        </p>

        <p className="mt-2 text-muted-foreground">
          minutes
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <form
            action="/api/study/focus/start"
            method="post"
          >
            <input
              type="hidden"
              name="studyItemId"
              value={item.id}
            />

            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              Start Focus Session
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border p-6">
        <h2 className="font-semibold">
          Before you start
        </h2>

        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            • Keep only the required study material open.
          </li>

          <li>
            • Set a clear goal for this session.
          </li>

          <li>
            • Avoid unnecessary notifications.
          </li>

          <li>
            • Record your confidence after completing the session.
          </li>
        </ul>
      </div>
    </div>
  );
}