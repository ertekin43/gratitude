import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import type { GratitudeEntry } from "@/lib/gratitude";

export type EntrySort = "newest" | "oldest";
export type AppPreferences = { privacyLock: boolean; theme: string; entrySort: EntrySort };
export type ProfilePreferences = { displayName: string; bio: string; avatarUri: string | null };
export const APP_PREFERENCES_KEY = "sukur-gunlugu.preferences.v1";
export const PROFILE_PREFERENCES_KEY = "sukur-gunlugu.profile.v1";
export const defaultPreferences: AppPreferences = { privacyLock: false, theme: "Adaçayı", entrySort: "newest" };
export const defaultProfile: ProfilePreferences = { displayName: "", bio: "", avatarUri: null };
export const themes = ["Adaçayı", "Günışığı", "Okyanus", "Lavanta", "Gül Kurusu", "Gece", "Kum", "Orman", "Gökyüzü", "Şeftali"];

export async function loadPreferences(): Promise<AppPreferences> { try { const value = JSON.parse((await AsyncStorage.getItem(APP_PREFERENCES_KEY)) || "null"); return { ...defaultPreferences, ...(value || {}) }; } catch { return defaultPreferences; } }
export async function savePreferences(value: AppPreferences) { await AsyncStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(value)); }
export async function loadProfilePreferences(): Promise<ProfilePreferences> { try { const value = JSON.parse((await AsyncStorage.getItem(PROFILE_PREFERENCES_KEY)) || "null"); return { ...defaultProfile, ...(value || {}) }; } catch { return defaultProfile; } }
export async function saveProfilePreferences(value: ProfilePreferences) { await AsyncStorage.setItem(PROFILE_PREFERENCES_KEY, JSON.stringify(value)); }

export async function exportJournal(entries: GratitudeEntry[]) {
  const uri = `${FileSystem.cacheDirectory}sukur-gunlugu-${new Date().toISOString().slice(0, 10)}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), entries }, null, 2));
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Şükür günlüğünü dışarı aktar" });
}
export async function importJournal(): Promise<GratitudeEntry[] | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: "application/json", copyToCacheDirectory: true });
  if (result.canceled) return null;
  const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
  const parsed = JSON.parse(raw) as { entries?: GratitudeEntry[] };
  if (!Array.isArray(parsed.entries)) throw new Error("Geçersiz günlük dosyası");
  return parsed.entries.filter((item) => item && typeof item.id === "string" && typeof item.text === "string" && typeof item.createdAt === "string");
}
