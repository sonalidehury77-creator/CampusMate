import { createClient } from "@/lib/supabase/server";

import type {
  Budget,
  Expense,
  ExpenseCategory,
  FinanceData,
  FinanceSummary,
} from "@/types/finance";

function getIndiaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function getMonthStart(date: string) {
  return `${date.slice(0, 7)}-01`;
}

function getMonthEnd(date: string) {
  const [year, month] = date
    .split("-")
    .map(Number);

  const lastDay = new Date(
    Date.UTC(
      year,
      month,
      0,
    ),
  ).getUTCDate();

  return `${year}-${String(month).padStart(
    2,
    "0",
  )}-${String(lastDay).padStart(2, "0")}`;
}

function calculatePercentage(
  amount: number,
  total: number,
) {
  if (total <= 0) {
    return 0;
  }

  return Math.round(
    (amount / total) * 100,
  );
}

export async function getFinanceData(): Promise<FinanceData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be signed in.",
    );
  }

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (studentError) {
    throw new Error(
      `Failed to load student: ${studentError.message}`,
    );
  }

  if (!student) {
    throw new Error(
      "Student profile is not configured.",
    );
  }

  const today = getIndiaToday();
  const monthStart =
    getMonthStart(today);
  const monthEnd =
    getMonthEnd(today);

  const [
    categoryResult,
    expenseResult,
    budgetResult,
  ] = await Promise.all([
    supabase
      .from("expense_categories")
      .select(
        `
          id,
          name,
          description
        `,
      )
      .order("name"),

    supabase
      .from("expenses")
      .select(
        `
          id,
          category_id,
          amount,
          title,
          description,
          expense_date,
          payment_method,
          expense_categories (
            name
          )
        `,
      )
      .eq(
        "student_id",
        student.id,
      )
      .gte(
        "expense_date",
        monthStart,
      )
      .lte(
        "expense_date",
        monthEnd,
      )
      .order("expense_date", {
        ascending: false,
      }),

    supabase
      .from("budgets")
      .select(
        `
          id,
          category_id,
          month_start,
          amount,
          expense_categories (
            name
          )
        `,
      )
      .eq(
        "student_id",
        student.id,
      )
      .eq(
        "month_start",
        monthStart,
      ),
  ]);

  if (categoryResult.error) {
    throw new Error(
      `Failed to load categories: ${categoryResult.error.message}`,
    );
  }

  if (expenseResult.error) {
    throw new Error(
      `Failed to load expenses: ${expenseResult.error.message}`,
    );
  }

  if (budgetResult.error) {
    throw new Error(
      `Failed to load budgets: ${budgetResult.error.message}`,
    );
  }

  const categories: ExpenseCategory[] =
    (categoryResult.data ?? []).map(
      (category) => ({
        id: category.id,
        name: category.name,
        description:
          category.description,
      }),
    );

  const expenses: Expense[] =
    (expenseResult.data ?? []).map(
      (expense) => {
        const category =
          Array.isArray(
            expense.expense_categories,
          )
            ? expense.expense_categories[0]
            : expense.expense_categories;

        return {
          id: expense.id,
          categoryId:
            expense.category_id,
          categoryName:
            category?.name ??
            "Other",
          amount: Number(
            expense.amount,
          ),
          title: expense.title,
          description:
            expense.description,
          expenseDate:
            expense.expense_date,
          paymentMethod:
            expense.payment_method,
        };
      },
    );

  const budgets: Budget[] =
    (budgetResult.data ?? []).map(
      (budget) => {
        const category =
          Array.isArray(
            budget.expense_categories,
          )
            ? budget.expense_categories[0]
            : budget.expense_categories;

        return {
          id: budget.id,
          categoryId:
            budget.category_id,
          categoryName:
            category?.name ?? null,
          monthStart:
            budget.month_start,
          amount: Number(
            budget.amount,
          ),
        };
      },
    );

  const totalSpent =
    expenses.reduce(
      (sum, expense) =>
        sum + expense.amount,
      0,
    );

  const todaySpent =
    expenses
      .filter(
        (expense) =>
          expense.expenseDate ===
          today,
      )
      .reduce(
        (sum, expense) =>
          sum + expense.amount,
        0,
      );

  const totalBudget =
    budgets.reduce(
      (sum, budget) =>
        sum + budget.amount,
      0,
    );

  const remainingBudget =
    Math.max(
      0,
      totalBudget - totalSpent,
    );

  const budgetUsedPercentage =
    calculatePercentage(
      totalSpent,
      totalBudget,
    );

  const daysPassed = Math.max(
    1,
    Math.floor(
      (
        new Date(
          `${today}T00:00:00+05:30`,
        ).getTime() -
        new Date(
          `${monthStart}T00:00:00+05:30`,
        ).getTime()
      ) /
        (1000 * 60 * 60 * 24),
    ) + 1,
  );

  const categoryMap =
    new Map<
      string,
      {
        name: string;
        amount: number;
      }
    >();

  for (const expense of expenses) {
    const existing =
      categoryMap.get(
        expense.categoryId,
      );

    categoryMap.set(
      expense.categoryId,
      {
        name:
          existing?.name ??
          expense.categoryName,
        amount:
          (existing?.amount ?? 0) +
          expense.amount,
      },
    );
  }

  const categorySpending =
    Array.from(
      categoryMap.entries(),
    )
      .map(
        ([
          categoryId,
          value,
        ]) => ({
          categoryId,
          categoryName:
            value.name,
          amount: value.amount,
          percentage:
            calculatePercentage(
              value.amount,
              totalSpent,
            ),
        }),
      )
      .sort(
        (a, b) =>
          b.amount - a.amount,
      );

  const summary: FinanceSummary = {
    monthStart,
    monthEnd,
    totalSpent,
    todaySpent,
    averageDailySpend:
      totalSpent / daysPassed,
    transactionCount:
      expenses.length,
    totalBudget,
    remainingBudget,
    budgetUsedPercentage,
    categorySpending,
    recentExpenses:
      expenses.slice(0, 8),
  };

  return {
    summary,
    categories,
    budgets,
    recentExpenses: expenses.slice(
      0,
      20,
    ),
  };
}