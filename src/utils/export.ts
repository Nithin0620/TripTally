// ============================================
// Export Utilities — CSV + Printable Summary
// ============================================

import { Trip, Activity, Expense, Settlement } from "@/types";
import { formatAmount } from "@/utils/currency";

/**
 * Download a string as a file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV field
 */
function csvEscape(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export expenses as CSV
 */
export function exportExpensesCSV(
  expenses: Expense[],
  tripTitle: string,
  currency: string
) {
  const headers = [
    "Title",
    "Amount",
    "Paid By",
    "Split Type",
    "Category",
    "Date",
    "Notes",
  ];

  const rows = expenses.map((expense) => [
    csvEscape(expense.title),
    csvEscape(formatAmount(expense.amount, currency)),
    csvEscape(expense.paidByUser?.name || "Unknown"),
    csvEscape(expense.split_type),
    csvEscape(expense.category || ""),
    csvEscape(new Date(expense.created_at).toLocaleDateString()),
    csvEscape((expense as any).notes || ""),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const filename = `${tripTitle.replace(/[^a-zA-Z0-9]/g, "_")}_expenses.csv`;
  downloadFile(csv, filename, "text/csv;charset=utf-8;");
}

/**
 * Export trip summary as printable HTML
 */
export function exportTripSummaryHTML(
  trip: Trip,
  activities: Activity[],
  expenses: Expense[],
  settlements: Settlement[]
) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currency = trip.currency || "INR";

  const activitiesByDate = activities.reduce<Record<string, Activity[]>>(
    (acc, a) => {
      const date = new Date(a.activity_date).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(a);
      return acc;
    },
    {}
  );

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${trip.title} — Trip Summary</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .subtitle { color: #64748b; font-size: 14px; margin-bottom: 32px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
    .stat-row { display: flex; gap: 24px; margin-bottom: 24px; }
    .stat { flex: 1; padding: 16px; background: #f8fafc; border-radius: 12px; }
    .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 24px; font-weight: 700; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:last-child td { border-bottom: none; }
    .day-header { font-weight: 600; padding: 8px 12px; background: #eff6ff; margin-top: 16px; border-radius: 8px 8px 0 0; font-size: 14px; }
    .settlement-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px; }
    .settlement-amount { font-weight: 700; color: #3b82f6; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>${trip.title}</h1>
  <p class="subtitle">
    ${new Date(trip.start_date).toLocaleDateString()} → ${new Date(trip.end_date).toLocaleDateString()}
    ${trip.description ? ` · ${trip.description}` : ""}
  </p>

  <div class="stat-row">
    <div class="stat">
      <div class="stat-label">Total Activities</div>
      <div class="stat-value">${activities.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Total Expenses</div>
      <div class="stat-value">${formatAmount(totalExpenses, currency)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Settlements</div>
      <div class="stat-value">${settlements.length}</div>
    </div>
    ${
      trip.budget_limit
        ? `<div class="stat">
      <div class="stat-label">Budget</div>
      <div class="stat-value">${formatAmount(trip.budget_limit, currency)}</div>
    </div>`
        : ""
    }
  </div>

  ${
    Object.keys(activitiesByDate).length > 0
      ? `
  <div class="section">
    <div class="section-title">Activities</div>
    ${Object.entries(activitiesByDate)
      .map(
        ([date, dayActivities]) => `
      <div class="day-header">${date}</div>
      <table>
        <thead>
          <tr><th>#</th><th>Activity</th><th>Location</th><th>Notes</th></tr>
        </thead>
        <tbody>
          ${dayActivities
            .map(
              (a, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${a.title}</strong></td>
              <td>${a.location || "—"}</td>
              <td>${a.notes || "—"}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    expenses.length > 0
      ? `
  <div class="section">
    <div class="section-title">Expenses</div>
    <table>
      <thead>
        <tr><th>Title</th><th>Amount</th><th>Paid By</th><th>Split</th><th>Category</th></tr>
      </thead>
      <tbody>
        ${expenses
          .map(
            (e) => `
          <tr>
            <td>${e.title}</td>
            <td><strong>${formatAmount(e.amount, currency)}</strong></td>
            <td>${e.paidByUser?.name || "Unknown"}</td>
            <td>${e.split_type}</td>
            <td>${e.category || "—"}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr>
          <td><strong>Total</strong></td>
          <td><strong>${formatAmount(totalExpenses, currency)}</strong></td>
          <td colspan="3"></td>
        </tr>
      </tfoot>
    </table>
  </div>
  `
      : ""
  }

  ${
    settlements.length > 0
      ? `
  <div class="section">
    <div class="section-title">Settlements</div>
    ${settlements
      .map(
        (s) => `
      <div class="settlement-item">
        <span><strong>${s.from_user?.name || "User"}</strong> pays <strong>${s.to_user?.name || "User"}</strong></span>
        <span class="settlement-amount">${formatAmount(s.amount, currency)}</span>
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  <div class="footer">
    Generated by TripTally on ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;

  const filename = `${trip.title.replace(/[^a-zA-Z0-9]/g, "_")}_summary.html`;
  downloadFile(html, filename, "text/html;charset=utf-8;");
}
