import AsyncStorage from "@react-native-async-storage/async-storage";

export const LISTENING_SETTINGS_KEY = "sukur-gunlugu.listening.v1";

export type ListeningSettings = {
  rate: number;
  gapSeconds: number;
  ambienceUri: string | null;
  ambienceName: string | null;
  ambienceVolume: number;
};

export const DEFAULT_LISTENING_SETTINGS: ListeningSettings = {
  rate: 1.2,
  gapSeconds: 2,
  ambienceUri: null,
  ambienceName: null,
  ambienceVolume: 35,
};

export function normalizeListeningSettings(parsed: Partial<ListeningSettings>): ListeningSettings {
  return {
    rate: typeof parsed.rate === "number" ? Math.min(2, Math.max(0.5, parsed.rate)) : DEFAULT_LISTENING_SETTINGS.rate,
    gapSeconds: typeof parsed.gapSeconds === "number" ? Math.min(30, Math.max(0, parsed.gapSeconds)) : DEFAULT_LISTENING_SETTINGS.gapSeconds,
    ambienceUri: typeof parsed.ambienceUri === "string" ? parsed.ambienceUri : null,
    ambienceName: typeof parsed.ambienceName === "string" ? parsed.ambienceName : null,
    ambienceVolume: typeof parsed.ambienceVolume === "number" ? Math.min(100, Math.max(0, parsed.ambienceVolume)) : DEFAULT_LISTENING_SETTINGS.ambienceVolume,
  };
}

export async function loadListeningSettings(): Promise<ListeningSettings> {
  try {
    const stored = await AsyncStorage.getItem(LISTENING_SETTINGS_KEY);
    if (!stored) return DEFAULT_LISTENING_SETTINGS;
    const parsed = JSON.parse(stored) as Partial<ListeningSettings>;
    return normalizeListeningSettings(parsed);
  } catch {
    return DEFAULT_LISTENING_SETTINGS;
  }
}

export async function saveListeningSettings(settings: ListeningSettings) {
  await AsyncStorage.setItem(LISTENING_SETTINGS_KEY, JSON.stringify(settings));
}
