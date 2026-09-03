import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const colors = { background: "#F8F6F0", surface: "#FFFFFF", ink: "#163B2B", muted: "#7B8A82", primary: "#2F7D5A", orange: "#E9905E", border: "#E6E8E2" };

type Props = { visible: boolean; onClose: () => void; onSave: (text: string) => Promise<void> };

export function QuickGratitudeModal({ visible, onClose, onSave }: Props) {
  const [text, setText] = useState("");
  const submit = async () => { const value = text.trim(); if (!value) return; await onSave(value); setText(""); onClose(); };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}><View><Text style={styles.eyebrow}>HIZLI ŞÜKRAN</Text><Text style={styles.title}>Şu an ne için şükrediyorsun?</Text></View><Pressable onPress={onClose} style={styles.close}><Ionicons name="close" size={20} color={colors.muted} /></Pressable></View>
          <View style={styles.composer}><TextInput autoFocus value={text} onChangeText={setText} multiline maxLength={220} placeholder="Mesajını yaz..." placeholderTextColor="#A9B1AB" style={styles.input} /><Pressable onPress={submit} disabled={!text.trim()} style={({ pressed }) => [styles.send, !text.trim() && styles.disabled, pressed && styles.pressed]} accessibilityLabel="Şükranı kaydet"><Ionicons name="arrow-up" size={18} color="#FFFFFF" /></Pressable></View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({ overlay: { flex: 1, justifyContent: "flex-end" }, backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(22,59,43,0.28)" }, sheet: { backgroundColor: colors.background, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: Platform.OS === "android" ? 18 : 28 }, handle: { alignSelf: "center", backgroundColor: "#D2D8D2", borderRadius: 3, height: 5, marginBottom: 19, width: 42 }, sheetHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }, eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 4 }, title: { color: colors.ink, fontSize: 17, fontWeight: "800" }, close: { alignItems: "center", height: 32, justifyContent: "center", width: 32 }, composer: { alignItems: "flex-end", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, flexDirection: "row", padding: 8 }, input: { color: colors.ink, flex: 1, fontSize: 14, lineHeight: 20, maxHeight: 110, minHeight: 42, paddingHorizontal: 9, paddingTop: 10 }, send: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 16, height: 32, justifyContent: "center", width: 32 }, disabled: { backgroundColor: "#B8C5BC" }, pressed: { opacity: 0.72, transform: [{ scale: 0.96 }] } });
