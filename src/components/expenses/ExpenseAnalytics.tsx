"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Expense } from "@/types";
import { convertAmount, formatAmount } from "@/utils/currency";
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  DollarSign,
  Wallet,
  CalendarDays,
} from "lucide-react";

interface ExpenseAnalyticsProps {
  expenses: Expense[];
  budgetLimit?: number;
  currency?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "#F59E0B",
  accommodation: "#3B82F6",
  transport: "#8B5CF6",
  activities: "#EC4899",
  shopping: "#10B981",
  general: "#64748B",
  flights: "#06B6D4",
  other: "#94A3B8",
};

const DEFAULT_COLOR = "#3B82F6";

function amountInCurrency(expense: Expense, currency: string) {
  return convertAmount(expense.amount, expense.currency, expense.exchange_rate, currency);
}

export default function ExpenseAnalytics({
  expenses,
  budgetLimit,
  currency = "INR",
}: ExpenseAnalyticsProps) {
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const exp of expenses) {
      const cat = (exp.category || "general").toLowerCase();
      totals[cat] = (totals[cat] || 0) + amountInCurrency(exp, currency);
    }
    return Object.entries(totals)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        rawCategory: name,
        value: Number(value.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, currency]);

  const memberData = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const exp of expenses) {
      const payer = exp.paidByUser?.name || exp.users?.name || "Unknown";
      totals[payer] = (totals[payer] || 0) + amountInCurrency(exp, currency);
    }
    return Object.entries(totals).map(([name, amount]) => ({
      name,
      amount: Number(amount.toFixed(2)),
    }));
  }, [expenses, currency]);

  const dailyData = useMemo(() => {
    const totals: Record<string, { label: string; amount: number }> = {};
    for (const exp of expenses) {
      const dateValue = new Date(exp.expense_date || exp.created_at);
      if (Number.isNaN(dateValue.getTime())) continue;

      const key = dateValue.toISOString().slice(0, 10);
      const label = dateValue.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!totals[key]) totals[key] = { label, amount: 0 };
      totals[key].amount += amountInCurrency(exp, currency);
    }

    return Object.entries(totals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        date: value.label,
        sortKey: key,
        amount: Number(value.amount.toFixed(2)),
      }));
  }, [expenses, currency]);

  const totalSpent = useMemo(
    () => expenses.reduce((sum, exp) => sum + amountInCurrency(exp, currency), 0),
    [expenses, currency]
  );

  const averagePerDay = dailyData.length > 0 ? totalSpent / dailyData.length : 0;

  const budgetProgress = useMemo(() => {
    if (!budgetLimit || budgetLimit <= 0) return null;
    return Math.round((totalSpent / budgetLimit) * 100);
  }, [totalSpent, budgetLimit]);

  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center text-slate-500">
        <PieIcon className="h-8 w-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold">No expenses recorded yet</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Analytics and spending charts will appear once you add your first expense.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span>Total Spent</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {formatAmount(totalSpent, currency)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Wallet className="h-4 w-4 text-emerald-600" />
            <span>Budget Limit</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {budgetLimit ? formatAmount(budgetLimit, currency) : "Not Set"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <CalendarDays className="h-4 w-4 text-amber-500" />
            <span>Daily Average</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {formatAmount(averagePerDay, currency)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <PieIcon className="h-4 w-4 text-amber-500" />
            <span>Top Category</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 truncate">
            {categoryData[0]?.name || "None"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span>Total Expenses</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {expenses.length}
          </div>
        </div>
      </div>

      {budgetProgress !== null && budgetLimit && (
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
            <span>Budget Utilization</span>
            <span
              className={
                budgetProgress > 100
                  ? "text-red-600 font-bold"
                  : budgetProgress > 90
                  ? "text-red-600 font-bold"
                  : budgetProgress > 75
                  ? "text-amber-600 font-bold"
                  : "text-emerald-600 font-bold"
              }
            >
              {budgetProgress}% ({formatAmount(totalSpent, currency)} / {formatAmount(budgetLimit, currency)})
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetProgress > 90 ? "bg-red-500" : budgetProgress > 75 ? "bg-amber-500" : "bg-blue-600"
              }`}
              style={{ width: `${Math.min(budgetProgress, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Expense by Category</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.rawCategory] || DEFAULT_COLOR}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatAmount(Number(val), currency)} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val: string) => (
                    <span className="text-xs text-slate-600">{val}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Spending by Member</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip formatter={(val: any) => formatAmount(Number(val), currency)} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Daily Spending</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip formatter={(val: any) => formatAmount(Number(val), currency)} />
              <Bar dataKey="amount" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
