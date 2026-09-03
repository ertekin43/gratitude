import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { usePlayer } from "@/lib/player-context";

const colors = { background: "#F8F6F0", ink: "#163B2B", muted: "#7B8A82", primary: "#2F7D5A", soft: "#E1F0E8", orange: "#E9905E", surface: "#FFFFFF" };

export default function PlayerScreen() {
  const router = useRouter();
  const { entries, currentIndex, isPlaying, settings, toggle, next, previous, hide } = usePlayer();
  const current = entries[currentIndex];
  if (!current) return <ScreenContainer containerClassName="bg-[#F8F6F0]" safeAreaClassName="bg-[#F8F6F0]"><View style={styles.empty}><Text style={styles.emptyTitle}>Henüz dinlenecek şükran yok</Text><Pressable onPress={() => router.back()} style={styles.backAction}><Text style={styles.backText}>Geri dön</Text></Pressable></View></ScreenContainer>;
  return (
    <ScreenContainer containerClassName="bg-[#F8F6F0]" safeAreaClassName="bg-[#F8F6F0]">
      <View style={styles.screen}>
        <View style={styles.top}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}><Ionicons name="chevron-down" size={23} color={colors.ink} /></Pressable><Text style={styles.topLabel}>ŞÜKRAN DİNLİYORSUN</Text><Pressable onPress={hide} style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]} accessibilityLabel="Oynatıcıyı kapat"><Ionicons name="close" size={20} color={colors.ink} /></Pressable></View>
        <View style={styles.art}><Ionicons name="leaf-outline" size={92} color={colors.primary} /><View style={styles.artSpark}><Ionicons name="sparkles" size={22} color={colors.orange} /></View></View>
        <Text style={styles.counter}>{currentIndex + 1} / {entries.length} · {settings.rate.toFixed(1)}x</Text>
        <Text style={styles.heading}>Şu an minnettar olduğun şey</Text>
        <Text style={styles.gratitude}>{current.text}</Text>
        <View style={styles.progress}><View style={[styles.progressFill, { width: `${((currentIndex + 1) / entries.length) * 100}%` }]} /></View>
        <View style={styles.controls}><Pressable onPress={previous} disabled={currentIndex === 0} style={({ pressed }) => [styles.skip, currentIndex === 0 && styles.disabled, pressed && styles.pressed]}><Ionicons name="play-skip-back" size={25} color={colors.ink} /></Pressable><Pressable onPress={toggle} style={({ pressed }) => [styles.mainPlay, pressed && styles.pressed]}><Ionicons name={isPlaying ? "pause" : "play"} size={31} color="#FFFFFF" /></Pressable><Pressable onPress={next} disabled={currentIndex >= entries.length - 1} style={({ pressed }) => [styles.skip, currentIndex >= entries.length - 1 && styles.disabled, pressed && styles.pressed]}><Ionicons name="play-skip-forward" size={25} color={colors.ink} /></Pressable></View>
        <Text style={styles.hint}>{isPlaying ? "Sakin bir nefes al ve dinle" : "Devam etmek için oynat"}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, paddingHorizontal: 24 }, top: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingTop: 15 }, topLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 }, circleButton: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 21, height: 42, justifyContent: "center", width: 42 }, art: { alignItems: "center", alignSelf: "center", backgroundColor: colors.soft, borderRadius: 115, height: 230, justifyContent: "center", marginTop: 62, width: 230 }, artSpark: { alignItems: "center", backgroundColor: "#FCE3D1", borderRadius: 20, bottom: 35, height: 40, justifyContent: "center", position: "absolute", right: 27, width: 40 }, counter: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginTop: 43, textAlign: "center" }, heading: { color: colors.muted, fontSize: 13, marginTop: 18, textAlign: "center" }, gratitude: { color: colors.ink, fontSize: 27, fontWeight: "800", lineHeight: 35, marginTop: 10, textAlign: "center" }, progress: { backgroundColor: "#DDE8E0", borderRadius: 3, height: 5, marginTop: 32, overflow: "hidden" }, progressFill: { backgroundColor: colors.primary, borderRadius: 3, height: 5 }, controls: { alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: 35 }, skip: { alignItems: "center", height: 55, justifyContent: "center", width: 60 }, mainPlay: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 34, elevation: 5, height: 68, justifyContent: "center", marginHorizontal: 22, shadowColor: colors.ink, shadowOpacity: 0.15, shadowRadius: 8, width: 68 }, hint: { color: colors.muted, fontSize: 11, marginTop: 19, textAlign: "center" }, disabled: { opacity: 0.25 }, pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] }, empty: { alignItems: "center", flex: 1, justifyContent: "center" }, emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" }, backAction: { backgroundColor: colors.primary, borderRadius: 14, marginTop: 16, paddingHorizontal: 18, paddingVertical: 12 }, backText: { color: "#FFFFFF", fontWeight: "800" } });
