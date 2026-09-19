"use client";

import { useTransition } from "react";

import { deleteExpense } from "@/app/(app)/finance/actions";
import type { Expense } from "@/types/finance";

type RecentExpensesProps = {
  expenses: Expense[];
};

export function RecentExpenses({
  expenses,
}: RecentExpensesProps) {
  const [isPending, startTransition] =
    useTransition();

  function removeExpense(
    expenseId: string,
  ) {
    if (
      !window.confirm(
        "Delete this expense?",
      )
    ) {
      return;
    }

    startTransition(() => {
      void deleteExpense(
        expenseId,
      );
    });
  }

  if (expenses.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border p-8 text-center">
        <h2 className="font-semibold">
          No expenses yet
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Add your first expense to start tracking your spending.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Transactions
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Recent expenses
        </h2>
      </div>

      <div className="mt-5 divide-y divide-border">
        {expenses.map(
          (expense) => (
            <div
              key={expense.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {expense.title}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {expense.categoryName} ·{" "}
                  {expense.expenseDate} ·{" "}
                  {expense.paymentMethod}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="font-bold">
                  ₹
                  {expense.amount.toFixed(
                    2,
                  )}
                </p>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    removeExpense(
                      expense.id,
                    )
                  }
                  className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}