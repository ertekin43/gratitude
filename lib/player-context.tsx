import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as Speech from "expo-speech";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { DEFAULT_LISTENING_SETTINGS, loadListeningSettings, type ListeningSettings } from "@/lib/listening-settings";
import type { GratitudeEntry } from "@/lib/gratitude";

type PlayerContextValue = {
  entries: GratitudeEntry[];
  currentIndex: number;
  isPlaying: boolean;
  isVisible: boolean;
  settings: ListeningSettings;
  playEntries: (entries: GratitudeEntry[], startIndex?: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  hide: () => void;
  setSettings: (settings: ListeningSettings) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettingsState] = useState(DEFAULT_LISTENING_SETTINGS);
  const entriesRef = useRef(entries);
  const settingsRef = useRef(settings);
  const ambienceRef = useRef<AudioPlayer | null>(null);
  const ambienceUriRef = useRef<string | null>(null);
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackTokenRef = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const notificationGenerationRef = useRef(0);

  useEffect(() => {
    loadListeningSettings().then((loaded) => { setSettingsState(loaded); settingsRef.current = loaded; });
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => undefined);
    return () => { Speech.stop(); if (gapTimerRef.current) clearTimeout(gapTimerRef.current); ambienceRef.current?.remove(); if (notificationIdRef.current && Platform.OS !== "web") Notifications.dismissNotificationAsync(notificationIdRef.current).catch(() => undefined); };
  }, []);

  useEffect(() => { entriesRef.current = entries; }, [entries]);

  useEffect(() => {
    settingsRef.current = settings;
    if (ambienceUriRef.current !== settings.ambienceUri) { ambienceRef.current?.remove(); ambienceRef.current = null; ambienceUriRef.current = settings.ambienceUri; }
    if (ambienceRef.current) ambienceRef.current.volume = settings.ambienceVolume / 100;
  }, [settings]);

  const fadeAmbience = useCallback((target: number) => {
    const player = ambienceRef.current; if (!player) return;
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    const from = player.volume; const start = Date.now();
    const tick = () => { const progress = Math.min(1, (Date.now() - start) / 200); player.volume = from + (target - from) * progress; if (progress < 1) fadeTimerRef.current = setTimeout(tick, 16); else fadeTimerRef.current = null; };
    tick();
  }, []);

  const stopAmbience = useCallback(() => { if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current); fadeTimerRef.current = null; if (!ambienceRef.current) return; ambienceRef.current.pause(); ambienceRef.current.seekTo(0); ambienceRef.current.volume = 0; }, []);

  const updatePlaybackNotification = useCallback(async (item: GratitudeEntry) => {
    if (Platform.OS === "web") return;
    const generation = ++notificationGenerationRef.current;
    await Notifications.dismissAllNotificationsAsync().catch(() => undefined);
    if (generation !== notificationGenerationRef.current) return;
    notificationIdRef.current = await Notifications.scheduleNotificationAsync({ content: { title: "Şükran dinleniyor", body: item.text, sticky: true, autoDismiss: false, sound: false, color: "#2F7D5A", data: { screen: "player", gratitudeId: item.id } }, trigger: null }).catch(() => null);
  }, []);

  const clearPlaybackNotification = useCallback(() => { notificationGenerationRef.current += 1; if (Platform.OS !== "web") Notifications.dismissAllNotificationsAsync().catch(() => undefined); notificationIdRef.current = null; }, []);

  const ensureAmbience = useCallback(() => {
    const uri = settingsRef.current.ambienceUri; if (!uri) return null;
    if (!ambienceRef.current) { ambienceRef.current = createAudioPlayer(uri); ambienceRef.current.loop = true; ambienceUriRef.current = uri; ambienceRef.current.volume = settingsRef.current.ambienceVolume / 100; }
    return ambienceRef.current;
  }, []);

  const speakAt = useCallback((index: number) => {
    const token = playbackTokenRef.current; const item = entriesRef.current[index];
    if (!item) { setIsPlaying(false); stopAmbience(); clearPlaybackNotification(); return; }
    setCurrentIndex(index); setIsPlaying(true); setIsVisible(true); updatePlaybackNotification(item);
    const ambience = ensureAmbience(); if (ambience) { ambience.play(); fadeAmbience(settingsRef.current.ambienceVolume / 100); }
    Speech.speak(item.text, { language: "tr-TR", rate: settingsRef.current.rate, pitch: 1,
      onDone: () => { if (token !== playbackTokenRef.current) return; fadeAmbience(1); const advance = () => { if (token !== playbackTokenRef.current) return; if (index + 1 < entriesRef.current.length) { fadeAmbience(settingsRef.current.ambienceVolume / 100); speakAt(index + 1); } else { setIsPlaying(false); setCurrentIndex(0); stopAmbience(); clearPlaybackNotification(); } }; gapTimerRef.current = setTimeout(advance, settingsRef.current.gapSeconds * 1000); },
      onStopped: () => { /* Bilinçli geçişlerde Speech.stop() çağrılır; durum yeni speakAt tarafından belirlenir. */ },
      onError: () => { if (token === playbackTokenRef.current) { setIsPlaying(false); stopAmbience(); clearPlaybackNotification(); } },
    });
  }, [clearPlaybackNotification, ensureAmbience, fadeAmbience, stopAmbience, updatePlaybackNotification]);

  const playEntries = useCallback((nextEntries: GratitudeEntry[], startIndex = 0) => { Speech.stop(); playbackTokenRef.current += 1; if (gapTimerRef.current) clearTimeout(gapTimerRef.current); setEntries(nextEntries); entriesRef.current = nextEntries; setIsVisible(nextEntries.length > 0); if (nextEntries.length) speakAt(Math.max(0, Math.min(startIndex, nextEntries.length - 1))); }, [speakAt]);

  const toggle = useCallback(() => { if (isPlaying) { Speech.stop(); playbackTokenRef.current += 1; if (gapTimerRef.current) clearTimeout(gapTimerRef.current); setIsPlaying(false); stopAmbience(); clearPlaybackNotification(); } else if (entriesRef.current.length) speakAt(currentIndex); }, [clearPlaybackNotification, currentIndex, isPlaying, speakAt, stopAmbience]);

  const stop = useCallback(() => { Speech.stop(); playbackTokenRef.current += 1; if (gapTimerRef.current) clearTimeout(gapTimerRef.current); setIsPlaying(false); setCurrentIndex(0); stopAmbience(); clearPlaybackNotification(); }, [clearPlaybackNotification, stopAmbience]);
  const hide = useCallback(() => { stop(); setIsVisible(false); }, [stop]);
  const next = useCallback(() => { Speech.stop(); playbackTokenRef.current += 1; if (gapTimerRef.current) clearTimeout(gapTimerRef.current); if (currentIndex + 1 < entriesRef.current.length) speakAt(currentIndex + 1); }, [currentIndex, speakAt]);
  const previous = useCallback(() => { Speech.stop(); playbackTokenRef.current += 1; if (gapTimerRef.current) clearTimeout(gapTimerRef.current); if (currentIndex > 0) speakAt(currentIndex - 1); }, [currentIndex, speakAt]);
  const setSettings = useCallback((nextSettings: ListeningSettings) => { settingsRef.current = nextSettings; setSettingsState(nextSettings); }, []);
  const value = useMemo(() => ({ entries, currentIndex, isPlaying, isVisible, settings, playEntries, toggle, next, previous, stop, hide, setSettings }), [currentIndex, entries, hide, isPlaying, isVisible, next, playEntries, previous, setSettings, settings, stop, toggle]);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() { const value = useContext(PlayerContext); if (!value) throw new Error("usePlayer must be used inside PlayerProvider"); return value; }
