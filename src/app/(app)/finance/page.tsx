import { PageHeader } from "@/components/layout/page-header";

import { AddExpenseForm } from "@/components/finance/add-expense-form";
import { BudgetOverview } from "@/components/finance/budget-overview";
import { CategorySpending } from "@/components/finance/category-spending";
import { RecentExpenses } from "@/components/finance/recent-expenses";
import { FinanceInsights } from "@/components/finance/finance-insights";
import { getFinanceData } from "@/services/finance/finance-data";

export default async function FinancePage() {
  const data =
    await getFinanceData();

  const {
    summary,
    categories,
    budgets,
    recentExpenses,
  } = data;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student Finance"
        title="Finance"
        description="Track your spending, manage your monthly budget and understand where your money goes."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            This month
          </p>

          <p className="mt-2 text-3xl font-bold">
            ₹
            {summary.totalSpent.toFixed(
              0,
            )}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Total spending
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Today
          </p>

          <p className="mt-2 text-3xl font-bold">
            ₹
            {summary.todaySpent.toFixed(
              0,
            )}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Today spending
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Daily average
          </p>

          <p className="mt-2 text-3xl font-bold">
            ₹
            {summary.averageDailySpend.toFixed(
              0,
            )}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Average per day
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Transactions
          </p>

          <p className="mt-2 text-3xl font-bold">
            {summary.transactionCount}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            This month
          </p>
        </div>
      </section>

      <BudgetOverview
        budgets={budgets}
        totalBudget={
          summary.totalBudget
        }
        totalSpent={
          summary.totalSpent
        }
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <CategorySpending
          categories={
            summary.categorySpending
          }
        />

        <AddExpenseForm
          categories={categories}
        />
      </section>

      <FinanceInsights
  totalBudget={
    summary.totalBudget
  }
  budgetUsedPercentage={
    summary.budgetUsedPercentage
  }
  averageDailySpend={
    summary.averageDailySpend
  }
  topCategory={
    summary.categorySpending[0]
      ? {
          name:
            summary.categorySpending[0]
              .categoryName,
          percentage:
            summary.categorySpending[0]
              .percentage,
        }
      : null
  }
/>

      <RecentExpenses
        expenses={recentExpenses}
      />
    </div>
  );
}