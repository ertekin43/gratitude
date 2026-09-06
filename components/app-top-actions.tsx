import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const colors = { surface: "#FFFFFF", border: "#E6E8E2", primary: "#2F7D5A" };

export function AppTopActions() {
  const router = useRouter();
  return <Pressable onPress={() => router.push("/settings")} style={({ pressed }) => [styles.button, pressed && styles.pressed]} accessibilityLabel="Ayarlar"><Ionicons name="settings-outline" size={18} color={colors.primary} /></Pressable>;
}

const styles = StyleSheet.create({ button: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 21, borderWidth: 1, height: 42, justifyContent: "center", width: 42 }, pressed: { opacity: 0.72, transform: [{ scale: 0.96 }] } });
