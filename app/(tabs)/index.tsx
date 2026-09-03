import { useCallback, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { QuickGratitudeModal } from "@/components/quick-gratitude-modal";
import { loadGratitudeEntries, saveGratitudeEntries, type GratitudeEntry } from "@/lib/gratitude";
import { usePlayer } from "@/lib/player-context";
import { loadDailyGoal, saveDailyGoal } from "@/lib/daily-goal";

const colors = {
  background: "#F8F6F0",
  surface: "#FFFFFF",
  ink: "#163B2B",
  muted: "#7B8A82",
  border: "#E6E8E2",
  primary: "#2F7D5A",
  primaryDark: "#1E6043",
  primarySoft: "#E1F0E8",
  orange: "#E9905E",
};

function formatEntryDate(date: Date) {
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function formatEntryTime(date: Date) {
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export default function HomeScreen() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [quickVisible, setQuickVisible] = useState(false);
  const router = useRouter();
  const { playEntries } = usePlayer();
  const [dailyGoal, setDailyGoal] = useState(5);
  const [goalText, setGoalText] = useState("5");
  const inputRef = useRef<TextInput>(null);

  const refreshEntries = useCallback(async () => {
    setRefreshing(true);
    setEntries(await loadGratitudeEntries());
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshEntries();
    }, [refreshEntries]),
  );

  useFocusEffect(useCallback(() => {
    loadDailyGoal().then((goal) => { setDailyGoal(goal); setGoalText(String(goal)); });
  }, []));

  const addEntry = useCallback(async () => {
    const text = draft.trim();
    if (!text || isSaving) return;

    setIsSaving(true);
    const nextEntry: GratitudeEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      createdAt: new Date().toISOString(),
    };
    const nextEntries = [nextEntry, ...entries];
    setEntries(nextEntries);
    setDraft("");
    inputRef.current?.focus();
    try {
      await saveGratitudeEntries(nextEntries);
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } finally {
      setIsSaving(false);
    }
  }, [draft, entries, isSaving]);

  const todayEntries = entries.filter((entry) => {
    const now = new Date();
    const date = new Date(entry.createdAt);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  });

  return (
    <ScreenContainer containerClassName="bg-[#F8F6F0]" safeAreaClassName="bg-[#F8F6F0]">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshEntries} tintColor={colors.primary} />}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <View>
                  <View style={styles.brandRow}>
                    <View style={styles.brandMark}>
                      <Ionicons name="leaf" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.brandText}>ŞÜKÜR GÜNLÜĞÜ</Text>
                  </View>
                  <Text style={styles.title}>Kalbinden geçenleri{`\n`}buraya bırak.</Text>
                </View>
                <View style={styles.topActions}>
                  <Pressable onPress={() => setQuickVisible(true)} style={({ pressed }) => [styles.roundButton, styles.roundButtonFilled, pressed && styles.pressed]} accessibilityLabel="Hızlı şükran yaz"><Ionicons name="flash-outline" size={18} color="#FFFFFF" /></Pressable>
                  <Pressable onPress={() => router.push("/settings")} style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]} accessibilityLabel="Ayarlar"><Ionicons name="settings-outline" size={18} color={colors.primary} /></Pressable>
                </View>
              </View>

              <View style={styles.todayCard}>
                <View style={styles.todayIcon}>
                  <Ionicons name="sunny" size={20} color={colors.orange} />
                </View>
                <View style={styles.todayCopy}>
                  <Text style={styles.todayLabel}>BUGÜNÜN ŞÜKÜRLERİ</Text>
                  <Text style={styles.todayCount}>{todayEntries.length} <Text style={styles.todayUnit}>madde</Text></Text>
                </View>
                <View style={styles.todayLeaf}>
                  <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
                </View>
              </View>
              <QuickGratitudeModal visible={quickVisible} onClose={() => setQuickVisible(false)} onSave={async (text) => {
                const nextEntry: GratitudeEntry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text, createdAt: new Date().toISOString() };
                const nextEntries = [nextEntry, ...entries];
                setEntries(nextEntries);
                await saveGratitudeEntries(nextEntries);
              }} />

              <View style={styles.composerCard}>
                <View style={styles.composerTop}>
                  <Text style={styles.composerTitle}>Şu an ne için şükrediyorsun?</Text>
                  <Ionicons name="heart-outline" size={19} color={colors.orange} />
                </View>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  multiline
                  ref={inputRef}
                  maxLength={1001}
                  placeholder="Bir düşünce, bir insan, küçük bir an..."
                  placeholderTextColor="#A9B1AB"
                  style={styles.input}
                  textAlignVertical="top"
                  blurOnSubmit={false}
                  returnKeyType="done"
                />
                <View style={styles.composerFooter}>
                  <Text style={styles.characterCount}>{draft.length}/1001</Text>
                  <Pressable
                    onPress={addEntry}
                    accessibilityRole="button"
                    accessibilityLabel="Şükür maddesi ekle"
                    style={({ pressed }) => [styles.addButton, pressed && styles.pressed, (!draft.trim() || isSaving) && styles.addButtonDisabled]}
                  >
                    <Text style={styles.addButtonText}>{isSaving ? "Ekleniyor" : "Ekle"}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.goalCard}>
                <View style={styles.goalHeader}><View style={styles.goalIcon}><Ionicons name="locate-outline" size={19} color={colors.primary} /></View><View style={styles.goalCopy}><Text style={styles.goalTitle}>Bugünün hedefi</Text><Text style={styles.goalText}>{todayEntries.length >= dailyGoal ? `Hedefini tamamladın. ${todayEntries.length} şükran kaydettin; istersen devam edebilirsin.` : `${dailyGoal - todayEntries.length} şükran daha eklediğinde hedefin tamamlanacak.`}</Text></View><View style={styles.goalInputWrap}><TextInput value={goalText} onChangeText={setGoalText} onBlur={async () => { const next = Math.min(999, Math.max(1, Number.parseInt(goalText, 10) || 1)); setDailyGoal(next); setGoalText(String(next)); await saveDailyGoal(next); }} keyboardType="number-pad" maxLength={3} style={styles.goalInput} /><Text style={styles.goalInputSuffix}>hedef</Text></View></View>
                <View style={styles.goalTrack}><View style={[styles.goalFill, { width: `${Math.min(100, (todayEntries.length / Math.max(dailyGoal, todayEntries.length, 1)) * 100)}%` }]} /><View style={[styles.goalMarker, { left: `${(dailyGoal / Math.max(dailyGoal, todayEntries.length, 1)) * 100}%` }]} /></View>
                <Text style={styles.goalStatus}>{todayEntries.length > dailyGoal ? `Hedefinin %${Math.round((todayEntries.length / dailyGoal - 1) * 100)} üzerindesin` : todayEntries.length === dailyGoal ? "Hedef tamamlandı" : `${todayEntries.length}/${dailyGoal} şükran`}</Text>
              </View>

              <View style={styles.listHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Şükürlerin</Text>
                  <Text style={styles.sectionSubtitle}>{entries.length ? "İyi olanı fark ettiğin anlar" : "İlk maddeni yazarak başla"}</Text>
                </View>
                <View style={styles.listHeaderActions}>
                  <Pressable onPress={() => playEntries(todayEntries)} disabled={todayEntries.length === 0} style={({ pressed }) => [styles.listenTodayButton, pressed && styles.pressed, todayEntries.length === 0 && styles.listenTodayDisabled]} accessibilityLabel="Bugünün şükürlerini dinle">
                    <Ionicons name="volume-high-outline" size={15} color={colors.primary} />
                    <Text style={styles.listenTodayText}>Dinle</Text>
                  </Pressable>
                  <View style={styles.totalPill}><Text style={styles.totalPillText}>{entries.length}</Text></View>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="leaf-outline" size={26} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Sayfan henüz boş</Text>
              <Text style={styles.emptyText}>Aklına gelen güzel bir şeyi yukarıya yaz. Her madde, kendine verdiğin küçük bir hediye.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.entryCard}>
              <View style={[styles.entryNumber, index === 0 && styles.entryNumberHighlight]}>
                <Text style={[styles.entryNumberText, index === 0 && styles.entryNumberTextHighlight]}>{String(entries.length - index).padStart(2, "0")}</Text>
              </View>
              <View style={styles.entryCopy}>
                <Text style={styles.entryText}>{item.text}</Text>
                <View style={styles.entryMeta}>
                  <Ionicons name="time-outline" size={12} color={colors.muted} />
                  <Text style={styles.entryMetaText}>{formatEntryDate(new Date(item.createdAt))} · {formatEntryTime(new Date(item.createdAt))}</Text>
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={19} color={colors.primary} />
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingHorizontal: 22, paddingBottom: 30 },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 18,
  },
  brandRow: { alignItems: "center", flexDirection: "row", marginBottom: 15 },
  brandMark: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 9,
    height: 25,
    justifyContent: "center",
    marginRight: 8,
    width: 25,
  },
  brandText: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  headerDot: { backgroundColor: colors.orange, borderRadius: 4, height: 8, marginTop: 12, width: 8 },
  topActions: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 7 },
  roundButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 21, borderWidth: 1, height: 42, justifyContent: "center", width: 42 },
  roundButtonFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", letterSpacing: -0.8, lineHeight: 35 },
  todayCard: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
    flexDirection: "row",
    marginTop: 24,
    padding: 15,
  },
  todayIcon: { alignItems: "center", backgroundColor: "#FCE3D1", borderRadius: 15, height: 38, justifyContent: "center", width: 38 },
  todayCopy: { flex: 1, marginLeft: 12 },
  todayLabel: { color: colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  todayCount: { color: colors.ink, fontSize: 22, fontWeight: "800", marginTop: 2 },
  todayUnit: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  todayLeaf: { alignItems: "center", backgroundColor: "#CDE7D8", borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  listenTodayButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#EEF5F0", borderRadius: 12, flexDirection: "row", gap: 7, marginTop: 9, paddingHorizontal: 11, paddingVertical: 8 },
  listenTodayDisabled: { opacity: 0.45 },
  listenTodayText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  listHeaderActions: { alignItems: "center", flexDirection: "row", gap: 7 },
  composerCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 15,
    padding: 16,
  },
  composerTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  composerTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  input: { color: colors.ink, fontSize: 14, lineHeight: 21, minHeight: 86, paddingTop: 15 },
  composerFooter: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  characterCount: { color: colors.muted, fontSize: 11 },
  addButton: { alignItems: "center", backgroundColor: colors.primaryDark, borderRadius: 13, flexDirection: "row", gap: 8, paddingHorizontal: 15, paddingVertical: 10 },
  addButtonDisabled: { opacity: 0.5 },
  addButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  goalCard: { backgroundColor: "#EAF3ED", borderColor: "#D5E8DA", borderRadius: 20, borderWidth: 1, marginTop: 14, padding: 15 },
  goalHeader: { alignItems: "center", flexDirection: "row" },
  goalIcon: { alignItems: "center", backgroundColor: "#D2E9D9", borderRadius: 15, height: 32, justifyContent: "center", width: 32 },
  goalCopy: { flex: 1, marginLeft: 10, marginRight: 8 },
  goalTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  goalText: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  goalInputWrap: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 9, paddingHorizontal: 5, paddingVertical: 3 },
  goalInput: { color: colors.ink, fontSize: 14, fontWeight: "800", height: 26, textAlign: "center", width: 30 },
  goalInputSuffix: { color: colors.muted, fontSize: 8 },
  goalTrack: { backgroundColor: "#CFE3D4", borderRadius: 4, height: 8, marginTop: 16, overflow: "visible", position: "relative" },
  goalFill: { backgroundColor: colors.primary, borderRadius: 4, height: 8 },
  goalMarker: { backgroundColor: colors.ink, height: 18, position: "absolute", top: -5, width: 2 },
  goalStatus: { color: colors.primary, fontSize: 11, fontWeight: "800", marginTop: 10, textAlign: "right" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
  listHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12, marginTop: 28 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  sectionSubtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
  totalPill: { alignItems: "center", backgroundColor: colors.orange, borderRadius: 13, height: 28, justifyContent: "center", minWidth: 28, paddingHorizontal: 8 },
  totalPillText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  entryCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, flexDirection: "row", marginBottom: 10, padding: 14 },
  entryNumber: { alignItems: "center", backgroundColor: "#F1F3EF", borderRadius: 12, height: 36, justifyContent: "center", marginRight: 12, width: 36 },
  entryNumberHighlight: { backgroundColor: colors.primarySoft },
  entryNumberText: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  entryNumberTextHighlight: { color: colors.primary },
  entryCopy: { flex: 1, marginRight: 10 },
  entryText: { color: colors.ink, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  entryMeta: { alignItems: "center", flexDirection: "row", gap: 4, marginTop: 7 },
  entryMetaText: { color: colors.muted, fontSize: 10 },
  emptyState: { alignItems: "center", backgroundColor: "#F1EDE2", borderRadius: 20, paddingHorizontal: 24, paddingVertical: 27 },
  emptyIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 19, height: 48, justifyContent: "center", marginBottom: 11, width: 48 },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6, textAlign: "center" },
});
