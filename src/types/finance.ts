export type ExpenseCategory = {
  id: string;
  name: string;
  description: string | null;
};

export type Expense = {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  title: string;
  description: string | null;
  expenseDate: string;
  paymentMethod: string;
};

export type Budget = {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  monthStart: string;
  amount: number;
};

export type CategorySpending = {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
};

export type FinanceSummary = {
  monthStart: string;
  monthEnd: string;

  totalSpent: number;
  todaySpent: number;
  averageDailySpend: number;

  transactionCount: number;

  totalBudget: number;
  remainingBudget: number;
  budgetUsedPercentage: number;

  categorySpending: CategorySpending[];

  recentExpenses: Expense[];
};

export type FinanceData = {
  summary: FinanceSummary;
  categories: ExpenseCategory[];
  budgets: Budget[];
  recentExpenses: Expense[];
};