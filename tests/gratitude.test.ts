import { describe, expect, it } from "vitest";

import {
  getDayChart,
  getEntriesForDay,
  getMonthChart,
  getYearChart,
  getWeekChart,
  isToday,
  isWithinCurrentMonth,
  isWithinCurrentWeek,
  pickRandomEntries,
  type GratitudeEntry,
} from "../lib/gratitude";
import { normalizeListeningSettings } from "../lib/listening-settings";
import { getLevelForCount, getRankForCount } from "../lib/profile-ranks";
import { getGoalProgress } from "../lib/daily-goal";

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

  it("limits random playback to the requested number without mutating the source", () => {
    const entries = [entry("one", "2026-09-03T08:00:00.000Z"), entry("two", "2026-09-03T09:00:00.000Z"), entry("three", "2026-09-03T10:00:00.000Z")];
    const selected = pickRandomEntries(entries, 2, () => 0.8);
    expect(selected).toHaveLength(2);
    expect(entries).toHaveLength(3);
    expect(new Set(selected.map((item) => item.id)).size).toBe(2);
  });

  it("normalizes listening settings to safe device limits", () => {
    expect(normalizeListeningSettings({ rate: 4, gapSeconds: -2, ambienceVolume: 130 })).toMatchObject({ rate: 2, gapSeconds: 0, ambienceVolume: 100 });
  });

  it("starts the annual chart in January and counts each month", () => {
    const chart = getYearChart([entry("jan", "2026-01-02T08:00:00.000Z"), entry("dec", "2026-12-02T08:00:00.000Z")], reference);
    expect(chart).toHaveLength(12);
    expect(chart[0].value).toBe(1);
    expect(chart[11].value).toBe(1);
  });

  it("maps 1260 recent gratitudes to the chess king rank", () => {
    expect(getRankForCount(1259).name).toBe("Vezir");
    expect(getRankForCount(1260).name).toBe("Şah");
    expect(getLevelForCount(1260)).toBe(127);
  });

  it("keeps an unfinished 300-item goal at 60 percent for 180 entries", () => {
    expect(getGoalProgress(180, 300)).toBe(0.6);
  });
});
