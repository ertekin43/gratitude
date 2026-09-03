import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { QuickGratitudeModal } from "@/components/quick-gratitude-modal";
import { loadGratitudeEntries, saveGratitudeEntries } from "@/lib/gratitude";

const colors = { surface: "#FFFFFF", border: "#E6E8E2", primary: "#2F7D5A" };

export function AppTopActions() {
  const router = useRouter();
  const [quickVisible, setQuickVisible] = useState(false);
  return <>
    <View style={styles.actions}>
      <Pressable onPress={() => setQuickVisible(true)} style={({ pressed }) => [styles.button, pressed && styles.pressed]} accessibilityLabel="Hızlı şükran yaz"><Ionicons name="flash-outline" size={18} color={colors.primary} /></Pressable>
      <Pressable onPress={() => router.push("/settings")} style={({ pressed }) => [styles.button, pressed && styles.pressed]} accessibilityLabel="Ayarlar"><Ionicons name="settings-outline" size={18} color={colors.primary} /></Pressable>
    </View>
    <QuickGratitudeModal visible={quickVisible} onClose={() => setQuickVisible(false)} onSave={async (text) => { const entries = await loadGratitudeEntries(); await saveGratitudeEntries([{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text, createdAt: new Date().toISOString() }, ...entries]); }} />
  </>;
}

const styles = StyleSheet.create({ actions: { alignItems: "center", flexDirection: "row", gap: 8 }, button: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 21, borderWidth: 1, height: 42, justifyContent: "center", width: 42 }, filled: { backgroundColor: colors.primary, borderColor: colors.primary }, pressed: { opacity: 0.72, transform: [{ scale: 0.96 }] } });
