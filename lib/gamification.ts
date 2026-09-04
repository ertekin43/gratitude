import type { GratitudeEntry } from "@/lib/gratitude";

export type Badge = { id: string; icon: string; title: string; description: string; unlocked: boolean };

function dayKey(date: Date) { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; }
export function getDistinctDayCount(entries: GratitudeEntry[]) { return new Set(entries.map((entry) => dayKey(new Date(entry.createdAt)))).size; }
export function getCurrentStreak(entries: GratitudeEntry[]) { const days = new Set(entries.map((entry) => dayKey(new Date(entry.createdAt)))); const cursor = new Date(); cursor.setHours(0, 0, 0, 0); let streak = 0; while (days.has(dayKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); } return streak; }
export function getBadges(entries: GratitudeEntry[]): Badge[] { const count = entries.length; const days = getDistinctDayCount(entries); const streak = getCurrentStreak(entries); return [
  { id: "first", icon: "🌱", title: "İlk adım", description: "İlk şükran kaydını yaz", unlocked: count >= 1 },
  { id: "ten", icon: "✨", title: "Kıvılcım", description: "10 şükran kaydı biriktir", unlocked: count >= 10 },
  { id: "week", icon: "🔥", title: "7 günlük ritim", description: "7 gün üst üste yaz", unlocked: streak >= 7 },
  { id: "days", icon: "🗓️", title: "Takvim gezgini", description: "30 farklı günde yaz", unlocked: days >= 30 },
  { id: "hundred", icon: "💎", title: "Yüz ışık", description: "100 şükrana ulaş", unlocked: count >= 100 },
  { id: "king", icon: "♛", title: "Şükür ustası", description: "Şah rütbesine ulaş", unlocked: count >= 1260 },
]; }
export function getJourneyStep(count: number) { const steps = [{ title: "Başlangıç bahçesi", min: 0, icon: "🌱" }, { title: "Farkındalık yolu", min: 10, icon: "🌿" }, { title: "Işık vadisi", min: 90, icon: "☀️" }, { title: "Minnet zirvesi", min: 360, icon: "⛰️" }, { title: "Şükür sarayı", min: 1260, icon: "🏰" }]; return steps.map((step, index) => ({ ...step, index, unlocked: count >= step.min, active: count >= step.min && (index === steps.length - 1 || count < steps[index + 1].min) })); }
