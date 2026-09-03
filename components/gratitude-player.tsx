import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";

import type { GratitudeEntry } from "@/lib/gratitude";

const colors = {
  surface: "#163B2B",
  text: "#FFFFFF",
  muted: "#B9D7C7",
  accent: "#F1B37C",
  soft: "#2F7D5A",
};

type GratitudePlayerProps = {
  entries: GratitudeEntry[];
  visible: boolean;
  onClose: () => void;
};

export function GratitudePlayer({ entries, visible, onClose }: GratitudePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rate, setRate] = useState(1.2);
  const entriesRef = useRef(entries);
  const rateRef = useRef(rate);

  useEffect(() => {
    entriesRef.current = entries;
    if (currentIndex >= entries.length) setCurrentIndex(0);
  }, [entries, currentIndex]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  const stop = useCallback(async () => {
    await Speech.stop();
    setIsPlaying(false);
  }, []);

  const speakAt = useCallback((index: number) => {
    const item = entriesRef.current[index];
    if (!item) {
      setIsPlaying(false);
      return;
    }
    setCurrentIndex(index);
    setIsPlaying(true);
    Speech.speak(item.text, {
      language: "tr-TR",
      rate: rateRef.current,
      pitch: 1,
      onDone: () => {
        if (index + 1 < entriesRef.current.length) {
          speakAt(index + 1);
        } else {
          setIsPlaying(false);
          setCurrentIndex(0);
        }
      },
      onError: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
    });
  }, []);

  useEffect(() => () => {
    Speech.stop();
  }, []);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      await stop();
      return;
    }
    await Speech.stop();
    speakAt(currentIndex);
  }, [currentIndex, isPlaying, speakAt, stop]);

  if (!visible || entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="volume-high" size={18} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Şükranlarını dinle</Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {isPlaying ? `${currentIndex + 1}/${entries.length} · ${entries[currentIndex]?.text}` : `${entries.length} madde hazır`}
        </Text>
      </View>
      <Pressable onPress={() => setRate(rate === 1.2 ? 1 : 1.2)} style={({ pressed }) => [styles.speedButton, pressed && styles.pressed]}>
        <Text style={styles.speedText}>{rate.toFixed(1)}x</Text>
      </Pressable>
      <Pressable onPress={togglePlayback} style={({ pressed }) => [styles.playButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={isPlaying ? "Dinlemeyi durdur" : "Şükranları dinle"}>
        <Ionicons name={isPlaying ? "stop" : "play"} size={16} color={colors.surface} />
      </Pressable>
      <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]} accessibilityLabel="Oynatıcıyı kapat">
        <Ionicons name="close" size={17} color={colors.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, flexDirection: "row", marginTop: 12, padding: 12 },
  iconWrap: { alignItems: "center", backgroundColor: colors.soft, borderRadius: 14, height: 32, justifyContent: "center", width: 32 },
  copy: { flex: 1, marginLeft: 10, marginRight: 7 },
  title: { color: colors.text, fontSize: 12, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 10, marginTop: 3 },
  speedButton: { borderColor: "#507C67", borderRadius: 8, borderWidth: 1, marginRight: 6, paddingHorizontal: 6, paddingVertical: 5 },
  speedText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  playButton: { alignItems: "center", backgroundColor: colors.accent, borderRadius: 16, height: 31, justifyContent: "center", width: 31 },
  closeButton: { alignItems: "center", height: 30, justifyContent: "center", marginLeft: 3, width: 24 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
});
