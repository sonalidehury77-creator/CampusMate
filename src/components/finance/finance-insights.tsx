type FinanceInsightsProps = {
  totalBudget: number;
  budgetUsedPercentage: number;
  averageDailySpend: number;
  topCategory: {
    name: string;
    percentage: number;
  } | null;
};

export function FinanceInsights({
  totalBudget,
  budgetUsedPercentage,
  averageDailySpend,
  topCategory,
}: FinanceInsightsProps) {
  const insights: string[] = [];

  if (
    totalBudget > 0 &&
    budgetUsedPercentage >= 90
  ) {
    insights.push(
      "You have used most of your monthly budget. Consider reviewing non-essential spending.",
    );
  } else if (
    totalBudget > 0 &&
    budgetUsedPercentage >= 75
  ) {
    insights.push(
      "Your monthly budget is getting significantly utilized. Keep an eye on the remaining days.",
    );
  }

  if (
    topCategory &&
    topCategory.percentage >= 40
  ) {
    insights.push(
      `${topCategory.name} currently represents ${topCategory.percentage}% of your recorded spending this month.`,
    );
  }

  if (
    averageDailySpend > 0
  ) {
    insights.push(
      `Your current average daily spending is ₹${averageDailySpend.toFixed(0)}.`,
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Keep recording your expenses to build a clearer picture of your spending habits.",
    );
  }

  return (
    <section className="rounded-2xl border border-brand-200 bg-brand-50/40 p-6">
      <p className="text-sm font-semibold text-brand-700">
        Smart Finance Insights
      </p>

      <h2 className="mt-1 text-xl font-bold">
        Understand your spending
      </h2>

      <div className="mt-5 space-y-3">
        {insights.map(
          (insight) => (
            <div
              key={insight}
              className="rounded-xl bg-background/70 p-4 text-sm leading-6"
            >
              {insight}
            </div>
          ),
        )}
      </div>
    </section>
  );
}