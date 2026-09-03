import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as Speech from "expo-speech";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

import { DEFAULT_LISTENING_SETTINGS, loadListeningSettings, type ListeningSettings } from "@/lib/listening-settings";
import type { GratitudeEntry } from "@/lib/gratitude";

type PlayerContextValue = {
  entries: GratitudeEntry[];
  currentIndex: number;
  isPlaying: boolean;
  settings: ListeningSettings;
  playEntries: (entries: GratitudeEntry[], startIndex?: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  setSettings: (settings: ListeningSettings) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettingsState] = useState(DEFAULT_LISTENING_SETTINGS);
  const entriesRef = useRef(entries);
  const settingsRef = useRef(settings);
  const ambienceRef = useRef<AudioPlayer | null>(null);
  const ambienceUriRef = useRef<string | null>(null);
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadListeningSettings().then((loaded) => {
      setSettingsState(loaded);
      settingsRef.current = loaded;
    });
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
    return () => {
      Speech.stop();
      if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
      ambienceRef.current?.remove();
      ambienceUriRef.current = null;
    };
  }, []);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    settingsRef.current = settings;
    if (ambienceUriRef.current !== settings.ambienceUri) {
      ambienceRef.current?.remove();
      ambienceRef.current = null;
      ambienceUriRef.current = settings.ambienceUri;
    }
    if (ambienceRef.current) ambienceRef.current.volume = settings.ambienceVolume / 100;
  }, [settings]);

  const fadeAmbience = useCallback((target: number) => {
    const player = ambienceRef.current;
    if (!player) return;
    const from = player.volume;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min(1, (Date.now() - start) / 200);
      player.volume = from + (target - from) * progress;
      if (progress < 1) setTimeout(tick, 16);
    };
    tick();
  }, []);

  const ensureAmbience = useCallback(() => {
    const uri = settingsRef.current.ambienceUri;
    if (!uri) return null;
    if (!ambienceRef.current) {
      ambienceRef.current = createAudioPlayer(uri);
      ambienceRef.current.loop = true;
      ambienceUriRef.current = uri;
      ambienceRef.current.volume = settingsRef.current.ambienceVolume / 100;
    }
    return ambienceRef.current;
  }, []);

  const speakAt = useCallback((index: number) => {
    const item = entriesRef.current[index];
    if (!item) {
      setIsPlaying(false);
      fadeAmbience(0);
      return;
    }
    setCurrentIndex(index);
    setIsPlaying(true);
    const ambience = ensureAmbience();
    if (ambience) {
      ambience.play();
      fadeAmbience(settingsRef.current.ambienceVolume / 100);
    }
    Speech.speak(item.text, {
      language: "tr-TR",
      rate: settingsRef.current.rate,
      pitch: 1,
      onDone: () => {
        fadeAmbience(1);
        gapTimerRef.current = setTimeout(() => {
          fadeAmbience(settingsRef.current.ambienceVolume / 100);
          if (index + 1 < entriesRef.current.length) speakAt(index + 1);
          else {
            setIsPlaying(false);
            setCurrentIndex(0);
            fadeAmbience(0);
          }
        }, settingsRef.current.gapSeconds * 1000);
      },
      onStopped: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  }, [ensureAmbience, fadeAmbience]);

  const playEntries = useCallback((nextEntries: GratitudeEntry[], startIndex = 0) => {
    Speech.stop();
    if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
    setEntries(nextEntries);
    entriesRef.current = nextEntries;
    const safeIndex = Math.max(0, Math.min(startIndex, nextEntries.length - 1));
    setCurrentIndex(safeIndex);
    if (nextEntries.length) speakAt(safeIndex);
  }, [speakAt]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      Speech.stop();
      if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
      setIsPlaying(false);
      fadeAmbience(1);
    } else if (entriesRef.current.length) {
      speakAt(currentIndex);
    }
  }, [currentIndex, fadeAmbience, isPlaying, speakAt]);

  const stop = useCallback(() => {
    Speech.stop();
    if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
    setIsPlaying(false);
    fadeAmbience(0);
  }, [fadeAmbience]);

  const next = useCallback(() => {
    Speech.stop();
    if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
    if (currentIndex + 1 < entriesRef.current.length) speakAt(currentIndex + 1);
  }, [currentIndex, speakAt]);

  const previous = useCallback(() => {
    Speech.stop();
    if (gapTimerRef.current) clearTimeout(gapTimerRef.current);
    if (currentIndex > 0) speakAt(currentIndex - 1);
  }, [currentIndex, speakAt]);

  const setSettings = useCallback((nextSettings: ListeningSettings) => {
    settingsRef.current = nextSettings;
    setSettingsState(nextSettings);
  }, []);

  const value = useMemo(() => ({ entries, currentIndex, isPlaying, settings, playEntries, toggle, next, previous, stop, setSettings }), [currentIndex, entries, isPlaying, next, playEntries, previous, setSettings, settings, stop, toggle]);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("usePlayer must be used inside PlayerProvider");
  return value;
}
