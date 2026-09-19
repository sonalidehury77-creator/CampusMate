import type { Budget } from "@/types/finance";

type BudgetOverviewProps = {
  budgets: Budget[];
  totalBudget: number;
  totalSpent: number;
};

export function BudgetOverview({
  budgets,
  totalBudget,
  totalSpent,
}: BudgetOverviewProps) {
  const percentage =
    totalBudget > 0
      ? Math.min(
          100,
          Math.round(
            (totalSpent /
              totalBudget) *
              100,
          ),
        )
      : 0;

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-600">
            Budget Health
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Monthly budget
          </h2>
        </div>

        <p className="text-lg font-bold">
          ₹{totalBudget.toFixed(0)}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            ₹{totalSpent.toFixed(0)} spent
          </span>

          <span className="font-semibold">
            {percentage}%
          </span>
        </div>

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${
              percentage >= 90
                ? "bg-red-500"
                : percentage >= 75
                  ? "bg-amber-500"
                  : "bg-brand-600"
            }`}
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>

      {budgets.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          No category budgets configured yet.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {budgets.map(
            (budget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3"
              >
                <span className="text-sm font-medium">
                  {budget.categoryName ??
                    "Overall"}
                </span>

                <span className="text-sm font-semibold">
                  ₹
                  {budget.amount.toFixed(
                    0,
                  )}
                </span>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}