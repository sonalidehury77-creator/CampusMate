"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const expenseSchema = z.object({
  categoryId: z.string().uuid(),
  title: z
    .string()
    .trim()
    .min(1)
    .max(120),
  description: z
    .string()
    .trim()
    .max(500)
    .optional(),
  amount: z
    .number()
    .positive()
    .max(10000000),
  expenseDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
    ),
  paymentMethod: z.enum([
    "cash",
    "upi",
    "card",
    "bank_transfer",
    "other",
  ]),
});

const budgetSchema = z.object({
  categoryId: z
    .string()
    .uuid()
    .nullable(),
  monthStart: z
    .string()
    .regex(
      /^\d{4}-\d{2}-01$/,
    ),
  amount: z
    .number()
    .positive()
    .max(10000000),
});

export async function createExpense(
  input: unknown,
) {
  const parsed =
    expenseSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      "Invalid expense details.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  const {
    data: student,
    error: studentError,
  } =
    await supabase
      .from("students")
      .select("id")
      .eq(
        "profile_id",
        user.id,
      )
      .maybeSingle();

  if (
    studentError ||
    !student
  ) {
    throw new Error(
      "Student profile not found.",
    );
  }

  const {
    categoryId,
    title,
    description,
    amount,
    expenseDate,
    paymentMethod,
  } = parsed.data;

  const { error } =
    await supabase
      .from("expenses")
      .insert({
        student_id:
          student.id,
        category_id:
          categoryId,
        title,
        description:
          description || null,
        amount,
        expense_date:
          expenseDate,
        payment_method:
          paymentMethod,
      });

  if (error) {
    throw new Error(
      `Unable to create expense: ${error.message}`,
    );
  }

  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

export async function deleteExpense(
  expenseId: string,
) {
  const parsed =
    z.string().uuid().safeParse(
      expenseId,
    );

  if (!parsed.success) {
    throw new Error(
      "Invalid expense.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  const { error } =
    await supabase
      .from("expenses")
      .delete()
      .eq(
        "id",
        parsed.data,
      );

  if (error) {
    throw new Error(
      `Unable to delete expense: ${error.message}`,
    );
  }

  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

export async function upsertBudget(
  input: unknown,
) {
  const parsed =
    budgetSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      "Invalid budget details.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  const {
    data: student,
    error: studentError,
  } =
    await supabase
      .from("students")
      .select("id")
      .eq(
        "profile_id",
        user.id,
      )
      .maybeSingle();

  if (
    studentError ||
    !student
  ) {
    throw new Error(
      "Student profile not found.",
    );
  }

  const {
    categoryId,
    monthStart,
    amount,
  } = parsed.data;

  let query =
    supabase
      .from("budgets")
      .select("id")
      .eq(
        "student_id",
        student.id,
      )
      .eq(
        "month_start",
        monthStart,
      );

  if (categoryId) {
    query = query.eq(
      "category_id",
      categoryId,
    );
  } else {
    query = query.is(
      "category_id",
      null,
    );
  }

  const {
    data: existing,
    error: existingError,
  } =
    await query.maybeSingle();

  if (existingError) {
    throw new Error(
      `Unable to check existing budget: ${existingError.message}`,
    );
  }

  if (existing) {
    const { error } =
      await supabase
        .from("budgets")
        .update({
          amount,
        })
        .eq(
          "id",
          existing.id,
        );

    if (error) {
      throw new Error(
        `Unable to update budget: ${error.message}`,
      );
    }
  } else {
    const { error } =
      await supabase
        .from("budgets")
        .insert({
          student_id:
            student.id,
          category_id:
            categoryId,
          month_start:
            monthStart,
          amount,
        });

    if (error) {
      throw new Error(
        `Unable to create budget: ${error.message}`,
      );
    }
  }

  revalidatePath("/finance");
  revalidatePath("/dashboard");
}