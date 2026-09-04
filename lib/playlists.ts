import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GratitudeEntry } from "@/lib/gratitude";

export type Playlist = { id: string; name: string; entryIds: string[]; createdAt: string };
export const PLAYLISTS_KEY = "sukur-gunlugu.playlists.v1";
export const DEFAULT_PLAYLIST_ID = "playlist-general";

export async function loadPlaylists(): Promise<Playlist[]> {
  try {
    const raw = await AsyncStorage.getItem(PLAYLISTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === "string" && typeof item.name === "string" && Array.isArray(item.entryIds)) : [];
  } catch { return []; }
}

export async function savePlaylists(playlists: Playlist[]) { await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists)); }

export function isDefaultPlaylist(playlist: Playlist) { return playlist.id === DEFAULT_PLAYLIST_ID || playlist.name === "Genel"; }

export async function ensureDefaultPlaylist(): Promise<Playlist[]> {
  const playlists = await loadPlaylists();
  const existing = playlists.find((item) => item.id === DEFAULT_PLAYLIST_ID || item.name === "Favorilerim" || item.name === "Genel");
  if (existing) {
    const normalized = playlists.map((item) => item.id === existing.id ? { ...item, id: DEFAULT_PLAYLIST_ID, name: "Genel" } : item);
    if (JSON.stringify(normalized) !== JSON.stringify(playlists)) await savePlaylists(normalized);
    return normalized;
  }
  const created = [{ id: DEFAULT_PLAYLIST_ID, name: "Genel", entryIds: [], createdAt: new Date().toISOString() }];
  await savePlaylists(created); return created;
}

export function entriesForPlaylist(entries: GratitudeEntry[], playlist: Playlist) { return playlist.entryIds.map((id) => entries.find((entry) => entry.id === id)).filter(Boolean) as GratitudeEntry[]; }
