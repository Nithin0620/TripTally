// ============================================
// Export Utilities — PDF / Calendar / CSV / HTML
// ============================================

import { Trip, Activity, Expense, Settlement } from "@/types";
import { formatAmount } from "@/utils/currency";
import {
  dateKeyFrom,
  getDateKey,
  getDayNumber,
  parseActivityNotes,
  parseTimeRange,
  sortActivities,
} from "@/utils/activity";

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function csvEscape(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeHtml(value: string | number | undefined | null): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value: string): string {
  return value.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "trip";
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function icsFold(line: string): string {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let current = "";

  for (const char of line) {
    if (encoder.encode(current + char).length > 75) {
      lines.push(current);
      current = ` ${char}`;
    } else {
      current += char;
    }
  }

  lines.push(current);
  return lines.join("\r\n");
}

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
    "Description",
    "Tags",
    "Currency",
    "Exchange Rate",
    "Notes",
  ];

  const rows = expenses.map((expense) => [
    expense.title,
    formatAmount(expense.amount, expense.currency || currency),
    expense.paidByUser?.name || "Unknown",
    expense.split_type,
    expense.category || "",
    getDateKey(expense.expense_date || expense.created_at),
    expense.description || "",
    (expense.tags || []).join("; "),
    expense.currency || currency,
    expense.exchange_rate ?? "",
    (expense as any).notes || "",
  ]);

  const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\r\n");
  downloadFile(csv, `${slugify(tripTitle)}_expenses.csv`, "text/csv;charset=utf-8;");
}

export function exportItineraryCSV(trip: Trip, activities: Activity[]) {
  const headers = [
    "Day",
    "Date",
    "Time Slot",
    "Activity",
    "Category",
    "Location",
    "Latitude",
    "Longitude",
    "Notes",
    "Status",
  ];

  const rows = sortActivities(activities).map((activity) => {
    const parsed = parseActivityNotes(activity.notes);
    return [
      getDayNumber(getDateKey(activity.activity_date), trip.start_date),
      getDateKey(activity.activity_date),
      parsed.timeSlot || "",
      activity.title,
      parsed.category || "",
      activity.location || "",
      activity.latitude ?? "",
      activity.longitude ?? "",
      parsed.description.replace(/\n/g, " "),
      parsed.completed ? "Completed" : "Pending",
    ];
  });

  const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\r\n");
  downloadFile(csv, `${slugify(trip.title)}_itinerary.csv`, "text/csv;charset=utf-8;");
}

export function exportItineraryICS(trip: Trip, activities: Activity[]) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TripTally//Itinerary//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsEscape(trip.title)}`,
  ];

  sortActivities(activities).forEach((activity) => {
    const compactDate = getDateKey(activity.activity_date).replace(/-/g, "");
    if (!/^\d{8}$/.test(compactDate)) return;

    const parsed = parseActivityNotes(activity.notes);
    const range = parseTimeRange(parsed.timeSlot);
    const pad = (value: number) => String(value).padStart(2, "0");
    const toDateTime = (baseDate: string, minutes: number) => {
      const date = new Date(
        `${baseDate.slice(0, 4)}-${baseDate.slice(4, 6)}-${baseDate.slice(6, 8)}T00:00:00`
      );
      date.setMinutes(minutes);
      return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
    };
    const addDay = (baseDate: string) => {
      const date = new Date(
        `${baseDate.slice(0, 4)}-${baseDate.slice(4, 6)}-${baseDate.slice(6, 8)}T00:00:00`
      );
      date.setDate(date.getDate() + 1);
      return dateKeyFrom(date).replace(/-/g, "");
    };

    const description = [
      parsed.description,
      parsed.category ? `Category: ${parsed.category}` : "",
      `Status: ${parsed.completed ? "Completed" : "Pending"}`,
    ]
      .filter(Boolean)
      .join("\n");

    const dtStart = range
      ? `DTSTART:${toDateTime(compactDate, range.startMinutes)}`
      : `DTSTART;VALUE=DATE:${compactDate}`;
    const dtEnd = !range
      ? `DTEND;VALUE=DATE:${addDay(compactDate)}`
      : range.endMinutes === undefined
        ? `DTEND:${toDateTime(compactDate, range.startMinutes + 60)}`
        : range.endMinutes > range.startMinutes
          ? `DTEND:${toDateTime(compactDate, range.endMinutes)}`
          : `DTEND:${toDateTime(addDay(compactDate), range.endMinutes)}`;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${activity.id.replace(/[^a-zA-Z0-9-]/g, "")}@triptally`,
      `DTSTAMP:${stamp}`,
      dtStart,
      dtEnd,
      `SUMMARY:${icsEscape(activity.title)}`,
      `DESCRIPTION:${icsEscape(description)}`,
    );

    if (activity.location) lines.push(`LOCATION:${icsEscape(activity.location)}`);
    if (parsed.category) lines.push(`CATEGORIES:${icsEscape(parsed.category)}`);
    if (
      typeof activity.latitude === "number" &&
      typeof activity.longitude === "number" &&
      Number.isFinite(activity.latitude) &&
      Number.isFinite(activity.longitude)
    ) {
      lines.push(`GEO:${activity.latitude};${activity.longitude}`);
    }
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  const ics = `${lines.map(icsFold).join("\r\n")}\r\n`;
  downloadFile(ics, `${slugify(trip.title)}_itinerary.ics`, "text/calendar;charset=utf-8;");
}

function buildTripSummaryHTML(
  trip: Trip,
  activities: Activity[],
  expenses: Expense[],
  settlements: Settlement[]
): string {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currency = trip.currency || "USD";
  const sortedActivities = sortActivities(activities);

  const activitiesByDate = sortedActivities.reduce<Record<string, Activity[]>>(
    (acc, activity) => {
      const date = getDateKey(activity.activity_date);
      if (!acc[date]) acc[date] = [];
      acc[date].push(activity);
      return acc;
    },
    {}
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(trip.title)} — Trip Summary</title>
  <style>
    @page { size: A4; margin: 16mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 24px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 26px; margin-bottom: 8px; }
    .subtitle { color: #64748b; font-size: 13px; margin-bottom: 28px; }
    .section { margin-bottom: 28px; break-inside: avoid; }
    .section-title { font-size: 17px; font-weight: 700; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
    .stat-row { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat { flex: 1; padding: 14px; background: #f8fafc; border-radius: 12px; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 9px 10px; background: #f1f5f9; font-weight: 600; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    .day-header { font-weight: 700; padding: 8px 12px; background: #eff6ff; margin-top: 14px; border-radius: 8px 8px 0 0; font-size: 13px; }
    .settlement-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px; }
    .settlement-amount { font-weight: 700; color: #3b82f6; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #94a3b8; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(trip.title)}</h1>
  <p class="subtitle">
    ${escapeHtml(getDateKey(trip.start_date))} → ${escapeHtml(getDateKey(trip.end_date))}
    ${trip.destination ? ` · ${escapeHtml(trip.destination)}` : ""}
    ${trip.description ? ` · ${escapeHtml(trip.description)}` : ""}
  </p>

  <div class="stat-row">
    <div class="stat">
      <div class="stat-label">Total Activities</div>
      <div class="stat-value">${activities.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Total Expenses</div>
      <div class="stat-value">${escapeHtml(formatAmount(totalExpenses, currency))}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Settlements</div>
      <div class="stat-value">${settlements.length}</div>
    </div>
    ${
      trip.budget_limit
        ? `<div class="stat">
      <div class="stat-label">Budget</div>
      <div class="stat-value">${escapeHtml(formatAmount(trip.budget_limit, currency))}</div>
    </div>`
        : ""
    }
  </div>

  ${
    Object.keys(activitiesByDate).length > 0
      ? `
  <div class="section">
    <div class="section-title">Itinerary</div>
    ${Object.entries(activitiesByDate)
      .map(
        ([date, dayActivities]) => `
      <div class="day-header">Day ${getDayNumber(date, trip.start_date)} — ${escapeHtml(date)}</div>
      <table>
        <thead>
          <tr><th>#</th><th>Time</th><th>Activity</th><th>Category</th><th>Location</th><th>Notes</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${dayActivities
            .map((activity, index) => {
              const parsed = parseActivityNotes(activity.notes);
              return `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(parsed.timeSlot || "—")}</td>
              <td><strong>${escapeHtml(activity.title)}</strong></td>
              <td>${escapeHtml(parsed.category || "—")}</td>
              <td>${escapeHtml(activity.location || "—")}</td>
              <td>${escapeHtml(parsed.description || "—")}</td>
              <td>${parsed.completed ? "Done" : "Pending"}</td>
            </tr>
          `;
            })
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
        <tr><th>Title</th><th>Date</th><th>Amount</th><th>Paid By</th><th>Split</th><th>Category</th><th>Description</th><th>Tags</th></tr>
      </thead>
      <tbody>
        ${expenses
          .map(
            (expense) => `
          <tr>
            <td>${escapeHtml(expense.title)}</td>
            <td>${escapeHtml(getDateKey(expense.expense_date || expense.created_at) || "—")}</td>
            <td><strong>${escapeHtml(formatAmount(expense.amount, expense.currency || currency))}</strong></td>
            <td>${escapeHtml(expense.paidByUser?.name || "Unknown")}</td>
            <td>${escapeHtml(expense.split_type)}</td>
            <td>${escapeHtml(expense.category || "—")}</td>
            <td>${escapeHtml(expense.description || "—")}</td>
            <td>${escapeHtml((expense.tags || []).join(", ") || "—")}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr>
          <td><strong>Total</strong></td>
          <td></td>
          <td><strong>${escapeHtml(formatAmount(totalExpenses, currency))}</strong></td>
          <td colspan="5"></td>
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
        (settlement) => `
      <div class="settlement-item">
        <span><strong>${escapeHtml(settlement.from_user?.name || "User")}</strong> pays <strong>${escapeHtml(settlement.to_user?.name || "User")}</strong></span>
        <span class="settlement-amount">${escapeHtml(formatAmount(settlement.amount, currency))}</span>
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  <div class="footer">
    Generated by TripTally on ${escapeHtml(new Date().toLocaleDateString())}
  </div>
</body>
</html>`;
}

export function exportTripSummaryHTML(
  trip: Trip,
  activities: Activity[],
  expenses: Expense[],
  settlements: Settlement[]
) {
  downloadFile(
    buildTripSummaryHTML(trip, activities, expenses, settlements),
    `${slugify(trip.title)}_summary.html`,
    "text/html;charset=utf-8;"
  );
}

export function exportTripSummaryPDF(
  trip: Trip,
  activities: Activity[],
  expenses: Expense[],
  settlements: Settlement[]
): boolean {
  const html = buildTripSummaryHTML(trip, activities, expenses, settlements);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    downloadFile(html, `${slugify(trip.title)}_summary.html`, "text/html;charset=utf-8;");
    return false;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);

  return true;
}
