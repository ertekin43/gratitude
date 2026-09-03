import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "@/lib/player-context";

const colors = { surface: "#163B2B", text: "#FFFFFF", muted: "#B9D7C7", accent: "#F1B37C", soft: "#2F7D5A" };

export function PersistentGratitudePlayer() {
  const { entries, currentIndex, isPlaying, settings, toggle, next, previous, stop } = usePlayer();
  if (!entries.length) return null;
  const current = entries[currentIndex];
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}><Ionicons name="volume-high" size={16} color={colors.accent} /></View>
      <View style={styles.copy}><Text style={styles.title} numberOfLines={1}>{current?.text || "Şükranların"}</Text><Text style={styles.subtitle}>{isPlaying ? `${currentIndex + 1}/${entries.length} · ${settings.rate.toFixed(1)}x` : "Duraklatıldı"}</Text></View>
      <Pressable onPress={previous} disabled={currentIndex === 0} style={({ pressed }) => [styles.control, currentIndex === 0 && styles.disabled, pressed && styles.pressed]} accessibilityLabel="Önceki şükür"><Ionicons name="play-skip-back" size={15} color={colors.muted} /></Pressable>
      <Pressable onPress={toggle} style={({ pressed }) => [styles.play, pressed && styles.pressed]} accessibilityLabel={isPlaying ? "Durdur" : "Oynat"}><Ionicons name={isPlaying ? "pause" : "play"} size={15} color={colors.surface} /></Pressable>
      <Pressable onPress={next} disabled={currentIndex >= entries.length - 1} style={({ pressed }) => [styles.control, currentIndex >= entries.length - 1 && styles.disabled, pressed && styles.pressed]} accessibilityLabel="Sonraki şükür"><Ionicons name="play-skip-forward" size={15} color={colors.muted} /></Pressable>
      <Pressable onPress={stop} style={({ pressed }) => [styles.close, pressed && styles.pressed]} accessibilityLabel="Oynatıcıyı kapat"><Ionicons name="close" size={16} color={colors.muted} /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, bottom: 76, elevation: 9, flexDirection: "row", left: 12, padding: 10, position: "absolute", right: 12, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 10, zIndex: 50 },
  iconWrap: { alignItems: "center", backgroundColor: colors.soft, borderRadius: 14, height: 30, justifyContent: "center", width: 30 },
  copy: { flex: 1, marginLeft: 9, marginRight: 4 }, title: { color: colors.text, fontSize: 11, fontWeight: "800" }, subtitle: { color: colors.muted, fontSize: 9, marginTop: 3 },
  control: { alignItems: "center", height: 29, justifyContent: "center", width: 29 }, play: { alignItems: "center", backgroundColor: colors.accent, borderRadius: 15, height: 30, justifyContent: "center", width: 30 }, close: { alignItems: "center", height: 28, justifyContent: "center", width: 25 }, disabled: { opacity: 0.3 }, pressed: { opacity: 0.7, transform: [{ scale: 0.95 }] },
});
