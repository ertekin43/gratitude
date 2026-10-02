import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ritual } from "@/lib/design-system";

const colors = { surface: ritual.ivory, border: ritual.line, primary: ritual.green };

export function AppTopActions() {
  const router = useRouter();
  return <Pressable onPress={() => router.push("/settings")} style={({ pressed }) => [styles.button, pressed && styles.pressed]} accessibilityLabel="Ayarlar"><Ionicons name="settings-outline" size={18} color={colors.primary} /></Pressable>;
}

const styles = StyleSheet.create({ button: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 0, borderWidth: 1, height: 40, justifyContent: "center", width: 40 }, pressed: { opacity: 0.72, transform: [{ scale: 0.96 }] } });
