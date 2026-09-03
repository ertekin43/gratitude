import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import { ScreenContainer } from "@/components/screen-container";
import { DEFAULT_REMINDER, loadReminderSettings, setDailyReminder, type ReminderSettings } from "@/lib/reminders";
import { DEFAULT_LISTENING_SETTINGS, loadListeningSettings, saveListeningSettings, type ListeningSettings } from "@/lib/listening-settings";
import { usePlayer } from "@/lib/player-context";
import { AppTopActions } from "@/components/app-top-actions";

const colors = { background: "#F8F6F0", surface: "#FFFFFF", ink: "#163B2B", muted: "#7B8A82", border: "#E6E8E2", primary: "#2F7D5A", primarySoft: "#E1F0E8", orange: "#E9905E", orangeSoft: "#FFF0E6", danger: "#C75C51" };

function Field({ label, value, onChangeText, suffix, keyboardType = "decimal-pad" }: { label: string; value: string; onChangeText: (value: string) => void; suffix: string; keyboardType?: "decimal-pad" | "number-pad" | "default" }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><View style={styles.fieldInputWrap}><TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} style={styles.fieldInput} /><Text style={styles.suffix}>{suffix}</Text></View></View>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { setSettings: setPlayerSettings } = usePlayer();
  const [reminder, setReminder] = useState<ReminderSettings>(DEFAULT_REMINDER);
  const [listening, setListening] = useState<ListeningSettings>(DEFAULT_LISTENING_SETTINGS);
  const [hourText, setHourText] = useState("20");
  const [minuteText, setMinuteText] = useState("00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([loadReminderSettings(), loadListeningSettings()]).then(([loadedReminder, loadedListening]) => {
      setReminder(loadedReminder); setHourText(String(loadedReminder.hour).padStart(2, "0")); setMinuteText(String(loadedReminder.minute).padStart(2, "0")); setListening(loadedListening);
    });
  }, []);

  const saveAll = async () => {
    const hour = Math.min(23, Math.max(0, Number.parseInt(hourText, 10) || 0));
    const minute = Math.min(59, Math.max(0, Number.parseInt(minuteText, 10) || 0));
    const nextReminder = { ...reminder, hour, minute };
    const nextListening = { ...listening, rate: Math.min(2, Math.max(0.5, Number.parseFloat(String(listening.rate)) || 1.2)), gapSeconds: Math.min(30, Math.max(0, Number.parseInt(String(listening.gapSeconds), 10) || 0)), ambienceVolume: Math.min(100, Math.max(0, Number.parseInt(String(listening.ambienceVolume), 10) || 0)) };
    setSaving(true);
    const result = await setDailyReminder(nextReminder);
    await saveListeningSettings(nextListening);
    setPlayerSettings(nextListening);
    setReminder(nextReminder); setListening(nextListening); setSaving(false);
    if (nextReminder.enabled && !result.granted) Alert.alert("Bildirim izni gerekli", "Hatırlatıcıyı çalıştırmak için Android bildirim izni vermelisin.");
    else Alert.alert("Ayarlar kaydedildi", "Dinleme ve hatırlatıcı ayarların güncellendi.");
  };

  const pickAmbience = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "audio/*", copyToCacheDirectory: true });
    if (!result.canceled) setListening((current) => ({ ...current, ambienceUri: result.assets[0].uri, ambienceName: result.assets[0].name }));
  };

  return (
    <ScreenContainer containerClassName="bg-[#F8F6F0]" safeAreaClassName="bg-[#F8F6F0]">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable><View style={styles.headerCopy}><Text style={styles.eyebrow}>UYGULAMAN</Text><Text style={styles.title}>Ayarlar</Text></View><AppTopActions /></View>

          <Text style={styles.sectionTitle}>Bildirim hatırlatıcı</Text>
          <View style={styles.card}>
            <View style={styles.cardHeading}><View style={styles.cardIcon}><Ionicons name="notifications-outline" size={19} color={colors.orange} /></View><View style={styles.cardCopy}><Text style={styles.cardTitle}>Günlük hatırlatıcı</Text><Text style={styles.cardSubtitle}>Her gün belirlediğin saatte sakin bir mola</Text></View><Pressable onPress={() => setReminder((current) => ({ ...current, enabled: !current.enabled }))} style={({ pressed }) => [styles.switch, reminder.enabled && styles.switchOn, pressed && styles.pressed]} accessibilityRole="switch" accessibilityState={{ checked: reminder.enabled }}><View style={[styles.switchKnob, reminder.enabled && styles.switchKnobOn]} /></Pressable></View>
            <View style={styles.timeRow}><Text style={styles.rowLabel}>Bildirim saati</Text><View style={styles.timeInputs}><TextInput value={hourText} onChangeText={setHourText} keyboardType="number-pad" maxLength={2} style={styles.timeInput} /><Text style={styles.colon}>:</Text><TextInput value={minuteText} onChangeText={setMinuteText} keyboardType="number-pad" maxLength={2} style={styles.timeInput} /></View></View>
            <Text style={styles.helper}>Saati 00–23, dakikayı 00–59 arasında elle yazabilirsin.</Text>
          </View>

          <Text style={styles.sectionTitle}>Dinleme ayarları</Text>
          <View style={styles.card}>
            <Field label="Çalma hızı" value={String(listening.rate)} onChangeText={(value) => setListening((current) => ({ ...current, rate: Number.parseFloat(value) || 0.5 }))} suffix="x" />
            <Field label="Şükranlar arası bekleme" value={String(listening.gapSeconds)} onChangeText={(value) => setListening((current) => ({ ...current, gapSeconds: Number.parseInt(value, 10) || 0 }))} suffix="sn" keyboardType="number-pad" />
            <Field label="Şükran okunurken atmosfer sesi" value={String(listening.ambienceVolume)} onChangeText={(value) => setListening((current) => ({ ...current, ambienceVolume: Number.parseInt(value, 10) || 0 }))} suffix="%" keyboardType="number-pad" />
            <Text style={styles.helper}>Şükranlar arası beklemede atmosfer sesi %100’e çıkar; geçiş 200 ms içinde yumuşakça yapılır.</Text>
            <View style={styles.musicRow}><View style={styles.musicIcon}><Ionicons name="musical-notes-outline" size={18} color={colors.primary} /></View><View style={styles.musicCopy}><Text style={styles.musicTitle}>Atmosfer müziği</Text><Text numberOfLines={1} style={styles.musicText}>{listening.ambienceName || "Telefonundan bir ses dosyası seç"}</Text></View>{listening.ambienceUri && <Pressable onPress={() => setListening((current) => ({ ...current, ambienceUri: null, ambienceName: null }))} style={styles.removeButton}><Ionicons name="trash-outline" size={16} color={colors.danger} /></Pressable>}<Pressable onPress={pickAmbience} style={({ pressed }) => [styles.chooseButton, pressed && styles.pressed]}><Ionicons name="folder-open-outline" size={15} color={colors.primary} /><Text style={styles.chooseText}>Seç</Text></Pressable></View>
          </View>

          <Pressable onPress={saveAll} disabled={saving} style={({ pressed }) => [styles.saveButton, saving && styles.disabled, pressed && styles.pressed]}><Ionicons name="checkmark-circle-outline" size={19} color="#FFFFFF" /><Text style={styles.saveText}>{saving ? "Kaydediliyor" : "Ayarları kaydet"}</Text></Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 }, content: { paddingHorizontal: 22, paddingBottom: 40, paddingTop: 18 }, header: { alignItems: "center", flexDirection: "row", marginBottom: 27 }, backButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, height: 40, justifyContent: "center", marginRight: 11, width: 40 }, headerCopy: { flex: 1 }, eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.6, marginBottom: 4 }, title: { color: colors.ink, fontSize: 30, fontWeight: "800" }, settingsIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 20, height: 40, justifyContent: "center", width: 40 }, sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: "800", marginBottom: 11, marginTop: 4 }, card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 21, borderWidth: 1, marginBottom: 24, padding: 15 }, cardHeading: { alignItems: "center", flexDirection: "row" }, cardIcon: { alignItems: "center", backgroundColor: colors.orangeSoft, borderRadius: 15, height: 34, justifyContent: "center", marginRight: 10, width: 34 }, cardCopy: { flex: 1 }, cardTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" }, cardSubtitle: { color: colors.muted, fontSize: 10, marginTop: 3 }, switch: { backgroundColor: "#CFD5D0", borderRadius: 12, height: 24, justifyContent: "center", padding: 2, width: 42 }, switchOn: { backgroundColor: colors.primary }, switchKnob: { backgroundColor: colors.surface, borderRadius: 10, height: 20, width: 20 }, switchKnobOn: { alignSelf: "flex-end" }, timeRow: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 15, paddingTop: 14 }, rowLabel: { color: colors.ink, fontSize: 12, fontWeight: "700" }, timeInputs: { alignItems: "center", flexDirection: "row" }, timeInput: { backgroundColor: "#F3F5F1", borderRadius: 9, color: colors.ink, fontSize: 15, fontWeight: "800", height: 35, textAlign: "center", width: 39 }, colon: { color: colors.ink, fontSize: 16, fontWeight: "800", marginHorizontal: 4 }, helper: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 10 }, field: { alignItems: "center", borderBottomColor: "#F0F1ED", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 51 }, fieldLabel: { color: colors.ink, flex: 1, fontSize: 12, fontWeight: "700" }, fieldInputWrap: { alignItems: "center", backgroundColor: "#F3F5F1", borderRadius: 9, flexDirection: "row", paddingHorizontal: 4 }, fieldInput: { color: colors.ink, fontSize: 13, fontWeight: "800", height: 35, paddingHorizontal: 7, textAlign: "right", width: 55 }, suffix: { color: colors.muted, fontSize: 11, fontWeight: "700", paddingRight: 6 }, musicRow: { alignItems: "center", backgroundColor: "#F3F5F1", borderRadius: 14, flexDirection: "row", marginTop: 14, padding: 10 }, musicIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 13, height: 30, justifyContent: "center", width: 30 }, musicCopy: { flex: 1, marginHorizontal: 9 }, musicTitle: { color: colors.ink, fontSize: 11, fontWeight: "800" }, musicText: { color: colors.muted, fontSize: 9, marginTop: 3 }, chooseButton: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 9, flexDirection: "row", gap: 4, paddingHorizontal: 8, paddingVertical: 7 }, chooseText: { color: colors.primary, fontSize: 10, fontWeight: "800" }, removeButton: { marginRight: 3, padding: 5 }, saveButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 15, flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 14 }, saveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" }, disabled: { opacity: 0.55 }, pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] } });
