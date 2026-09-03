import { describe, expect, it } from "vitest";

import {
  getDayChart,
  getEntriesForDay,
  getMonthChart,
  getWeekChart,
  isToday,
  isWithinCurrentMonth,
  isWithinCurrentWeek,
  type GratitudeEntry,
} from "../lib/gratitude";

const reference = new Date(2026, 8, 3, 12, 0, 0);

function entry(id: string, createdAt: string): GratitudeEntry {
  return { id, text: id, createdAt };
}

describe("gratitude date helpers", () => {
  it("recognizes today, current week, and current month entries", () => {
    expect(isToday(new Date(2026, 8, 3, 8), reference)).toBe(true);
    expect(isToday(new Date(2026, 8, 2, 23), reference)).toBe(false);
    expect(isWithinCurrentWeek(new Date(2026, 8, 1, 8), reference)).toBe(true);
    expect(isWithinCurrentWeek(new Date(2026, 7, 30, 8), reference)).toBe(false);
    expect(isWithinCurrentMonth(new Date(2026, 8, 29), reference)).toBe(true);
    expect(isWithinCurrentMonth(new Date(2026, 7, 29), reference)).toBe(false);
  });

  it("counts entries by local calendar day", () => {
    const entries = [
      entry("one", "2026-09-03T07:00:00.000Z"),
      entry("two", "2026-09-03T15:00:00.000Z"),
      entry("three", "2026-09-02T15:00:00.000Z"),
    ];

    expect(getEntriesForDay(entries, new Date(2026, 8, 3))).toBe(2);
  });

  it("creates a seven-day chart with the correct peak", () => {
    const entries = [
      entry("monday-1", "2026-08-31T08:00:00.000Z"),
      entry("monday-2", "2026-08-31T12:00:00.000Z"),
      entry("today", "2026-09-03T08:00:00.000Z"),
    ];

    const chart = getWeekChart(entries, reference);
    expect(chart).toHaveLength(7);
    expect(chart.map((item) => item.value)).toEqual([0, 0, 0, 2, 0, 0, 1]);
  });

  it("groups the current month into week buckets", () => {
    const entries = [
      entry("first", "2026-09-01T08:00:00.000Z"),
      entry("seventh", "2026-09-07T08:00:00.000Z"),
      entry("eighth", "2026-09-08T08:00:00.000Z"),
      entry("last-month", "2026-08-31T08:00:00.000Z"),
    ];

    const chart = getMonthChart(entries, reference);
    expect(chart).toHaveLength(5);
    expect(chart[0].value).toBe(2);
    expect(chart[1].value).toBe(1);
    expect(chart[4].label).toBe("29-30");
  });

  it("creates a six-point day chart", () => {
    const entries = [entry("yesterday", "2026-09-02T08:00:00.000Z")];
    const chart = getDayChart(entries, reference);
    expect(chart).toHaveLength(6);
    expect(chart.at(-1)?.value).toBe(0);
  });
});
