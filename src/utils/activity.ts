import { Activity } from "@/types";

export interface ActivityNotes {
  completed: boolean;
  timeSlot?: string;
  category?: string;
  description: string;
}

export function parseActivityNotes(notes?: string | null): ActivityNotes {
  const raw = notes || "";
  const timeMatch = raw.match(/⏰\s*([^\r\n]+)/);
  const categoryMatch = raw.match(/🏷️\s*([^\r\n]+)/);

  return {
    completed: /\[x\]|\[COMPLETED\]/i.test(raw),
    timeSlot: timeMatch?.[1]?.trim() || undefined,
    category: categoryMatch?.[1]?.trim() || undefined,
    description: raw
      .replace(/\[x\]/gi, "")
      .replace(/\[COMPLETED\]/gi, "")
      .replace(/⏰\s*[^\r\n]*/g, "")
      .replace(/🏷️\s*[^\r\n]*/g, "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n"),
  };
}

export function buildActivityNotes(input: {
  timeSlot?: string;
  category?: string;
  notes?: string;
  completed?: boolean;
}): string | undefined {
  const parts = [
    input.completed ? "[x]" : null,
    input.timeSlot?.trim() ? `⏰ ${input.timeSlot.trim()}` : null,
    input.category?.trim() ? `🏷️ ${input.category.trim()}` : null,
    input.notes?.trim() ? input.notes.trim() : null,
  ].filter(Boolean);

  return parts.length ? parts.join("\n\n") : undefined;
}

export function parseTimeRange(
  label?: string | null
): { startMinutes: number; endMinutes?: number } | null {
  if (!label?.trim()) return null;

  const parts = label
    .split(/\s*(?:–|—|-|\bto\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  const toMinutes = (token?: string): number | undefined => {
    const match = token?.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!match) return undefined;

    let hours = Number(match[1]);
    const minutes = match[2] ? Number(match[2]) : 0;
    const meridiem = match[3]?.toLowerCase();

    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
    if (hours > 23 || minutes > 59) return undefined;

    return hours * 60 + minutes;
  };

  const startMinutes = toMinutes(parts[0]);
  if (startMinutes === undefined) return null;

  const endMinutes = parts[1] ? toMinutes(parts[1]) : undefined;
  return { startMinutes, endMinutes };
}

export function getDateKey(value?: string | null): string {
  return value?.slice(0, 10) || "";
}

export function dateKeyFrom(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayNumber(dateKey: string, startDate?: string): number {
  const startKey = getDateKey(startDate);
  if (!startKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !/^\d{4}-\d{2}-\d{2}$/.test(startKey)) {
    return 1;
  }

  const date = new Date(`${dateKey}T00:00:00`);
  const start = new Date(`${startKey}T00:00:00`);
  if (isNaN(date.getTime()) || isNaN(start.getTime())) return 1;

  const diff = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
    Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());

  return Math.max(1, Math.round(diff / 86400000) + 1);
}

export function sortActivities(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    const dateCompare = getDateKey(a.activity_date).localeCompare(getDateKey(b.activity_date));
    if (dateCompare !== 0) return dateCompare;

    const aStart = parseTimeRange(parseActivityNotes(a.notes).timeSlot)?.startMinutes ?? Number.MAX_SAFE_INTEGER;
    const bStart = parseTimeRange(parseActivityNotes(b.notes).timeSlot)?.startMinutes ?? Number.MAX_SAFE_INTEGER;
    if (aStart !== bStart) return aStart - bStart;

    return (a.order_index ?? 0) - (b.order_index ?? 0);
  });
}
