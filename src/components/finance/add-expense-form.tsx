"use client";

import { useState, useTransition } from "react";

import { createExpense } from "@/app/(app)/finance/actions";
import type { ExpenseCategory } from "@/types/finance";

type AddExpenseFormProps = {
  categories: ExpenseCategory[];
};

export function AddExpenseForm({
  categories,
}: AddExpenseFormProps) {
  const [isPending, startTransition] =
    useTransition();

  const [error, setError] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [categoryId, setCategoryId] =
    useState(
      categories[0]?.id ?? "",
    );

  const [expenseDate, setExpenseDate] =
    useState(
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "Asia/Kolkata",
        },
      ).format(new Date()),
    );

  const [paymentMethod, setPaymentMethod] =
    useState("upi");

  function submit() {
    setError("");

    const numericAmount =
      Number(amount);

    if (
      !categoryId ||
      !title.trim() ||
      !numericAmount ||
      numericAmount <= 0
    ) {
      setError(
        "Please enter a valid expense.",
      );
      return;
    }

    startTransition(() => {
      void createExpense({
        categoryId,
        title,
        amount: numericAmount,
        expenseDate,
        paymentMethod,
      })
        .then(() => {
          setAmount("");
          setTitle("");
        })
        .catch((submissionError) => {
          setError(
            submissionError instanceof
              Error
              ? submissionError.message
              : "Unable to save expense.",
          );
        });
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Add Expense
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Record your spending
        </h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">
            Title
          </label>

          <input
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value,
              )
            }
            placeholder="Lunch"
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Amount
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value,
              )
            }
            placeholder="150"
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Category
          </label>

          <select
            value={categoryId}
            onChange={(event) =>
              setCategoryId(
                event.target.value,
              )
            }
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500"
          >
            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">
            Payment method
          </label>

          <select
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(
                event.target.value,
              )
            }
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500"
          >
            <option value="upi">
              UPI
            </option>

            <option value="cash">
              Cash
            </option>

            <option value="card">
              Card
            </option>

            <option value="bank_transfer">
              Bank transfer
            </option>

            <option value="other">
              Other
            </option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">
            Date
          </label>

          <input
            type="date"
            value={expenseDate}
            onChange={(event) =>
              setExpenseDate(
                event.target.value,
              )
            }
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={submit}
        className="mt-5 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : "Add expense"}
      </button>
    </section>
  );
}