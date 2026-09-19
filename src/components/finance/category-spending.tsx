import type { CategorySpending } from "@/types/finance";

type CategorySpendingProps = {
  categories: CategorySpending[];
};

export function CategorySpending({
  categories,
}: CategorySpendingProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm font-semibold text-brand-600">
        Spending Analysis
      </p>

      <h2 className="mt-1 text-xl font-bold">
        Where your money goes
      </h2>

      {categories.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No spending recorded this month.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {categories.map(
            (category) => (
              <div key={category.categoryId}>
                <div className="flex justify-between gap-4">
                  <span className="text-sm font-medium">
                    {category.categoryName}
                  </span>

                  <span className="text-sm font-semibold">
                    ₹
                    {category.amount.toFixed(
                      0,
                    )}{" "}
                    ·{" "}
                    {category.percentage}
                    %
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{
                      width: `${category.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}