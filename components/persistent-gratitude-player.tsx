import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { usePlayer } from "@/lib/player-context";
import { ritual, ritualFonts } from "@/lib/design-system";

const colors = { surface: ritual.night, text: ritual.ivory, muted: "#B8C8C0", accent: ritual.gold, soft: "#254E42" };

export function PersistentGratitudePlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const { entries, currentIndex, isPlaying, isVisible, settings, toggle, next, previous, hide } = usePlayer();
  if (!entries.length || !isVisible || pathname === "/settings" || pathname === "/player") return null;
  const current = entries[currentIndex];
  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.push("/player")} style={({ pressed }) => [styles.copy, pressed && styles.pressed]} accessibilityLabel="Tam ekran dinleme ekranını aç">
        <View style={styles.iconWrap}><Ionicons name="volume-high" size={17} color={colors.accent} /></View>
        <View style={styles.copyText}><Text style={styles.title} numberOfLines={1}>{current?.text || "Şükranların"}</Text><Text style={styles.subtitle}>{isPlaying ? `${currentIndex + 1}/${entries.length} · ${settings.rate.toFixed(1)}x` : "Duraklatıldı · Tam ekran için dokun"}</Text></View>
      </Pressable>
      <Pressable onPress={previous} disabled={currentIndex === 0} style={({ pressed }) => [styles.control, currentIndex === 0 && styles.disabled, pressed && styles.pressed]} accessibilityLabel="Önceki şükür"><Ionicons name="play-skip-back" size={17} color={colors.muted} /></Pressable>
      <Pressable onPress={toggle} style={({ pressed }) => [styles.play, pressed && styles.pressed]} accessibilityLabel={isPlaying ? "Durdur" : "Oynat"}><Ionicons name={isPlaying ? "pause" : "play"} size={16} color={colors.surface} /></Pressable>
      <Pressable onPress={next} disabled={currentIndex >= entries.length - 1} style={({ pressed }) => [styles.control, currentIndex >= entries.length - 1 && styles.disabled, pressed && styles.pressed]} accessibilityLabel="Sonraki şükür"><Ionicons name="play-skip-forward" size={17} color={colors.muted} /></Pressable>
      <Pressable onPress={hide} style={({ pressed }) => [styles.close, pressed && styles.pressed]} accessibilityLabel="Mini çaları kapat"><Ionicons name="close" size={18} color={colors.muted} /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({ container: { alignItems: "center", backgroundColor: colors.surface, borderColor: "#39564D", borderRadius: 8, borderWidth: 1, bottom: 76, elevation: 10, flexDirection: "row", left: 8, minHeight: 86, padding: 13, position: "absolute", right: 8, shadowColor: "#000", shadowOpacity: 0.24, shadowRadius: 14, zIndex: 50 }, copy: { alignItems: "center", flex: 1, flexDirection: "row", marginRight: 7 }, iconWrap: { alignItems: "center", backgroundColor: colors.soft, borderRadius: 18, height: 38, justifyContent: "center", width: 38 }, copyText: { flex: 1, marginLeft: 10 }, title: { color: colors.text, fontFamily: ritualFonts.bodySemi, fontSize: 13 }, subtitle: { color: colors.muted, fontFamily: ritualFonts.body, fontSize: 10, marginTop: 5 }, control: { alignItems: "center", height: 42, justifyContent: "center", width: 37 }, play: { alignItems: "center", backgroundColor: colors.accent, borderRadius: 21, height: 42, justifyContent: "center", width: 42 }, close: { alignItems: "center", height: 38, justifyContent: "center", marginLeft: 2, width: 31 }, disabled: { opacity: 0.3 }, pressed: { opacity: 0.72, transform: [{ scale: 0.95 }] } });
