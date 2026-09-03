import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { localDateKey, loadGratitudeEntries, pickRandomEntries, saveGratitudeEntries, type GratitudeEntry } from "@/lib/gratitude";
import { usePlayer } from "@/lib/player-context";
import { AppTopActions } from "@/components/app-top-actions";

const colors = {
  background: "#F8F6F0",
  surface: "#FFFFFF",
  ink: "#163B2B",
  muted: "#7B8A82",
  border: "#E6E8E2",
  primary: "#2F7D5A",
  primarySoft: "#E1F0E8",
  orange: "#E9905E",
  orangeSoft: "#FFF0E6",
  danger: "#C75C51",
};

type DayGroup = { key: string; date: Date; entries: GratitudeEntry[] };

function formatDayHeading(date: Date) {
  const today = new Date();
  if (localDateKey(date) === localDateKey(today)) return "Bugün";
  return date.toLocaleDateString("tr-TR", { weekday: "long" }).replace(/^./, (value) => value.toUpperCase());
}

function formatDayDate(date: Date) {
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryScreen() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [randomCount, setRandomCount] = useState("3");
  const [refreshing, setRefreshing] = useState(false);
  const { playEntries } = usePlayer();

  const refreshEntries = useCallback(async () => {
    setRefreshing(true);
    setEntries(await loadGratitudeEntries());
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    refreshEntries();
  }, [refreshEntries]));

  const groups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>();
    entries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const key = localDateKey(date);
      const existing = map.get(key);
      if (existing) existing.entries.push(entry);
      else map.set(key, { key, date, entries: [entry] });
    });
    return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries]);

  const removeEntry = useCallback((entry: GratitudeEntry) => {
    Alert.alert("Maddeyi sil", "Bu şükür maddesi kalıcı olarak silinsin mi?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          const next = entries.filter((item) => item.id !== entry.id);
          setEntries(next);
          await saveGratitudeEntries(next);
        },
      },
    ]);
  }, [entries]);

  const beginEdit = (entry: GratitudeEntry) => {
    setEditingId(entry.id);
    setEditingText(entry.text);
  };

  const saveEdit = useCallback(async (entry: GratitudeEntry) => {
    const text = editingText.trim();
    if (!text) return;
    const next = entries.map((item) => item.id === entry.id ? { ...item, text } : item);
    setEntries(next);
    setEditingId(null);
    setEditingText("");
    await saveGratitudeEntries(next);
  }, [editingText, entries]);

  const playRandom = useCallback(() => {
    const count = Math.max(1, Math.min(entries.length, Number.parseInt(randomCount, 10) || 1));
    playEntries(pickRandomEntries(entries, count));
  }, [entries, playEntries, randomCount]);

  return (
    <ScreenContainer containerClassName="bg-[#F8F6F0]" safeAreaClassName="bg-[#F8F6F0]">
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshEntries} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>ZAMAN İÇİNDE</Text>
            <Text style={styles.title}>Geçmişin</Text>
          </View>
          <View style={styles.headerRight}><View style={styles.archiveIcon}><Ionicons name="time-outline" size={21} color={colors.primary} /></View><AppTopActions /></View>
        </View>
        <Text style={styles.intro}>İyi olanı fark ettiğin günlere dön.</Text>
        <View style={styles.randomCard}>
          <View style={styles.randomIcon}><Ionicons name="shuffle-outline" size={18} color={colors.orange} /></View>
          <View style={styles.randomCopy}><Text style={styles.randomTitle}>Rastgele şükran dinle</Text><Text style={styles.randomText}>Kaç kayıt çalsın?</Text></View>
          <TextInput value={randomCount} onChangeText={setRandomCount} keyboardType="number-pad" maxLength={2} style={styles.randomInput} />
          <Pressable onPress={playRandom} disabled={!entries.length} style={({ pressed }) => [styles.randomButton, !entries.length && styles.disabled, pressed && styles.pressed]}><Ionicons name="play" size={14} color="#FFFFFF" /></Pressable>
        </View>

        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}><Ionicons name="calendar-outline" size={25} color={colors.primary} /></View>
            <Text style={styles.emptyTitle}>Henüz geçmiş yok</Text>
            <Text style={styles.emptyText}>Bugün eklediğin maddeler burada gün gün birikecek.</Text>
          </View>
        ) : groups.map((group) => {
          const expanded = expandedKey === group.key;
          return (
            <View key={group.key} style={styles.dayCard}>
              <Pressable onPress={() => setExpandedKey(expanded ? null : group.key)} style={({ pressed }) => [styles.dayHeader, pressed && styles.pressed]}>
                <View style={styles.dayIcon}><Ionicons name={group.key === localDateKey(new Date()) ? "sunny-outline" : "calendar-outline"} size={18} color={colors.primary} /></View>
                <View style={styles.dayCopy}>
                  <Text style={styles.dayTitle}>{formatDayHeading(group.date)}</Text>
                  <Text style={styles.dayDate}>{formatDayDate(group.date)}</Text>
                </View>
                <View style={styles.dayCount}><Text style={styles.dayCountText}>{group.entries.length}</Text></View>
                <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
              </Pressable>
              {expanded && (
                <View style={styles.dayDetail}>
                  <View style={styles.detailToolbar}>
                    <Text style={styles.detailLabel}>ŞÜKÜR MADDELERİ</Text>
                    <Pressable onPress={() => playEntries(group.entries)} style={({ pressed }) => [styles.listenButton, pressed && styles.pressed]}>
                      <Ionicons name="volume-high-outline" size={14} color={colors.primary} />
                      <Text style={styles.listenText}>Dinle</Text>
                    </Pressable>
                  </View>
                  {group.entries.map((entry) => {
                    const editing = editingId === entry.id;
                    return (
                      <View key={entry.id} style={styles.entryRow}>
                        <View style={styles.entryBullet}><Ionicons name="checkmark" size={12} color={colors.primary} /></View>
                        <View style={styles.entryCopy}>
                          {editing ? (
                            <TextInput value={editingText} onChangeText={setEditingText} multiline autoFocus style={styles.editInput} />
                          ) : <Text style={styles.entryText}>{entry.text}</Text>}
                          <Text style={styles.entryTime}>{formatTime(new Date(entry.createdAt))}</Text>
                        </View>
                        {editing ? (
                          <View style={styles.actions}>
                            <Pressable onPress={() => saveEdit(entry)} style={styles.actionButton}><Ionicons name="checkmark" size={17} color={colors.primary} /></Pressable>
                            <Pressable onPress={() => setEditingId(null)} style={styles.actionButton}><Ionicons name="close" size={17} color={colors.muted} /></Pressable>
                          </View>
                        ) : (
                          <View style={styles.actions}>
                            <Pressable onPress={() => beginEdit(entry)} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]} accessibilityLabel="Şükür maddesini düzenle"><Ionicons name="pencil-outline" size={16} color={colors.primary} /></Pressable>
                            <Pressable onPress={() => removeEntry(entry)} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]} accessibilityLabel="Şükür maddesini sil"><Ionicons name="trash-outline" size={16} color={colors.danger} /></Pressable>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingBottom: 34, paddingTop: 18 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  headerRight: { alignItems: "center", flexDirection: "row", gap: 8 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.8, marginBottom: 4 },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", letterSpacing: -0.8 },
  archiveIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 20, height: 42, justifyContent: "center", width: 42 },
  intro: { color: colors.muted, fontSize: 13, marginBottom: 23, marginTop: 7 },
  randomCard: { alignItems: "center", backgroundColor: colors.orangeSoft, borderRadius: 18, flexDirection: "row", marginBottom: 15, minHeight: 66, padding: 15 },
  randomIcon: { alignItems: "center", backgroundColor: "#FFE0C9", borderRadius: 14, height: 31, justifyContent: "center", width: 31 },
  randomCopy: { flex: 1, marginLeft: 9 },
  randomTitle: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  randomText: { color: colors.muted, fontSize: 10, marginTop: 2 },
  randomInput: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.ink, fontSize: 12, fontWeight: "800", height: 30, marginRight: 6, paddingHorizontal: 8, textAlign: "center", width: 38 },
  randomButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 15, height: 30, justifyContent: "center", width: 30 },
  disabled: { opacity: 0.4 },
  emptyState: { alignItems: "center", backgroundColor: "#F1EDE2", borderRadius: 22, marginTop: 80, paddingHorizontal: 25, paddingVertical: 29 },
  emptyIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 19, height: 48, justifyContent: "center", marginBottom: 11, width: 48 },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  emptyText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6, textAlign: "center" },
  dayCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 19, borderWidth: 1, marginBottom: 11, overflow: "hidden" },
  dayHeader: { alignItems: "center", flexDirection: "row", padding: 14 },
  dayIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 15, height: 34, justifyContent: "center", width: 34 },
  dayCopy: { flex: 1, marginLeft: 11 },
  dayTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  dayDate: { color: colors.muted, fontSize: 11, marginTop: 3 },
  dayCount: { alignItems: "center", backgroundColor: colors.orangeSoft, borderRadius: 11, height: 26, justifyContent: "center", marginRight: 10, minWidth: 26, paddingHorizontal: 7 },
  dayCountText: { color: colors.orange, fontSize: 11, fontWeight: "800" },
  dayDetail: { borderTopColor: colors.border, borderTopWidth: 1, padding: 14 },
  detailToolbar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  detailLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  listenButton: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 10, flexDirection: "row", gap: 5, paddingHorizontal: 9, paddingVertical: 6 },
  listenText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  entryRow: { alignItems: "flex-start", borderTopColor: "#F1F2EE", borderTopWidth: 1, flexDirection: "row", paddingVertical: 11 },
  entryBullet: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 10, height: 20, justifyContent: "center", marginRight: 9, marginTop: 2, width: 20 },
  entryCopy: { flex: 1, marginRight: 6 },
  entryText: { color: colors.ink, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  entryTime: { color: colors.muted, fontSize: 10, marginTop: 4 },
  editInput: { borderColor: colors.primary, borderRadius: 8, borderWidth: 1, color: colors.ink, fontSize: 13, lineHeight: 19, minHeight: 45, padding: 7 },
  actions: { alignItems: "center", flexDirection: "row", gap: 2 },
  actionButton: { alignItems: "center", borderRadius: 9, height: 31, justifyContent: "center", width: 30 },
  pressed: { opacity: 0.68, transform: [{ scale: 0.98 }] },
});
