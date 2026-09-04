import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GratitudeEntry } from "@/lib/gratitude";

export type Playlist = { id: string; name: string; entryIds: string[]; createdAt: string };
export const PLAYLISTS_KEY = "sukur-gunlugu.playlists.v1";

export async function loadPlaylists(): Promise<Playlist[]> {
  try {
    const raw = await AsyncStorage.getItem(PLAYLISTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === "string" && typeof item.name === "string" && Array.isArray(item.entryIds)) : [];
  } catch { return []; }
}
export async function savePlaylists(playlists: Playlist[]) { await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists)); }
export async function ensureDefaultPlaylist() {
  const playlists = await loadPlaylists();
  if (playlists.length) return playlists;
  const created = [{ id: `playlist-${Date.now()}`, name: "Favorilerim", entryIds: [], createdAt: new Date().toISOString() }];
  await savePlaylists(created); return created;
}
export function entriesForPlaylist(entries: GratitudeEntry[], playlist: Playlist) { return playlist.entryIds.map((id) => entries.find((entry) => entry.id === id)).filter(Boolean) as GratitudeEntry[]; }
