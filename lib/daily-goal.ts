import AsyncStorage from "@react-native-async-storage/async-storage";

export const DAILY_GOAL_KEY = "sukur-gunlugu.daily-goal.v1";
export const DEFAULT_DAILY_GOAL = 5;

export function getGoalProgress(count: number, goal: number) {
  return Math.min(1, Math.max(0, count) / Math.max(1, goal));
}

export async function loadDailyGoal() {
  const stored = await AsyncStorage.getItem(DAILY_GOAL_KEY).catch(() => null);
  const value = stored ? Number.parseInt(stored, 10) : DEFAULT_DAILY_GOAL;
  return Number.isFinite(value) ? Math.min(999, Math.max(1, value)) : DEFAULT_DAILY_GOAL;
}

export async function saveDailyGoal(value: number) {
  await AsyncStorage.setItem(DAILY_GOAL_KEY, String(Math.min(999, Math.max(1, Math.floor(value)))));
}
