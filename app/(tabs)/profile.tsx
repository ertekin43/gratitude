import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import {
  getDayChart,
  getMonthChart,
  getWeekChart,
  isToday,
  isWithinCurrentMonth,
  isWithinCurrentWeek,
  loadGratitudeEntries,
  saveGratitudeEntries,
  type GratitudeEntry,
} from "@/lib/gratitude";
import { DEFAULT_REMINDER, loadReminderSettings, setDailyReminder, type ReminderSettings } from "@/lib/reminders";
import { startOAuthLogin } from "@/constants/oauth";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
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

type ChartRange = "day" | "week" | "month";

function formatDate(date: Date) {
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function formatReminderTime(settings: ReminderSettings) {
  return `${String(settings.hour).padStart(2, "0")}:${String(settings.minute).padStart(2, "0")}`;
}

export default function ProfileScreen() {
  const { user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [range, setRange] = useState<ChartRange>("week");
  const [refreshing, setRefreshing] = useState(false);
  const [reminder, setReminder] = useState(DEFAULT_REMINDER);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "synced">("idle");

  const cloudQuery = trpc.gratitude.list.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const syncMutation = trpc.gratitude.sync.useMutation();

  const refreshEntries = useCallback(async () => {
    setRefreshing(true);
    setEntries(await loadGratitudeEntries());
    setReminder(await loadReminderSettings());
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    refreshEntries();
  }, [refreshEntries]));

  useEffect(() => {
    if (!cloudQuery.data) return;
    const mergeCloudEntries = async () => {
      const local = await loadGratitudeEntries();
      const mergedMap = new Map<string, GratitudeEntry>();
      local.forEach((entry) => mergedMap.set(entry.id, entry));
      cloudQuery.data.forEach((entry) => mergedMap.set(entry.id, { id: entry.id, text: entry.text, createdAt: new Date(entry.createdAt).toISOString() }));
      const merged = Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setEntries(merged);
      await saveGratitudeEntries(merged);
    };
    mergeCloudEntries();
  }, [cloudQuery.data]);

  const syncToCloud = useCallback(async () => {
    if (!isAuthenticated) {
      await startOAuthLogin();
      return;
    }
    setSyncState("syncing");
    try {
      const local = await loadGratitudeEntries();
      const synced = await syncMutation.mutateAsync({ entries: local.map((entry) => ({ ...entry, createdAt: new Date(entry.createdAt) })) });
      const normalized = synced.map((entry) => ({ id: entry.id, text: entry.text, createdAt: new Date(entry.createdAt).toISOString() }));
      await saveGratitudeEntries(normalized);
      setEntries(normalized);
      setSyncState("synced");
    } catch {
      setSyncState("idle");
      Alert.alert("Senkronizasyon başarısız", "Bağlantını kontrol edip tekrar deneyebilirsin.");
    }
  }, [isAuthenticated, syncMutation]);

  const toggleReminder = useCallback(async () => {
    const next = { ...reminder, enabled: !reminder.enabled };
    const result = await setDailyReminder(next);
    if (!result.granted && next.enabled) {
      Alert.alert("Bildirim izni gerekli", "Günlük hatırlatıcıyı açmak için Android bildirim iznini vermelisin.");
    }
    setReminder(result.granted || !next.enabled ? next : { ...next, enabled: false });
  }, [reminder]);

  const cycleReminderTime = useCallback(async () => {
    const times = [{ hour: 20, minute: 0 }, { hour: 21, minute: 0 }, { hour: 8, minute: 30 }];
    const currentIndex = times.findIndex((item) => item.hour === reminder.hour && item.minute === reminder.minute);
    const nextTime = times[(currentIndex + 1) % times.length];
    const next = { ...reminder, ...nextTime };
    if (reminder.enabled) await setDailyReminder(next);
    setReminder(next);
  }, [reminder]);

  const todayCount = useMemo(() => entries.filter((entry) => isToday(new Date(entry.createdAt))).length, [entries]);
  const weekCount = useMemo(() => entries.filter((entry) => isWithinCurrentWeek(new Date(entry.createdAt))).length, [entries]);
  const monthCount = useMemo(() => entries.filter((entry) => isWithinCurrentMonth(new Date(entry.createdAt))).length, [entries]);
  const chartData = useMemo(() => range === "day" ? getDayChart(entries) : range === "month" ? getMonthChart(entries) : getWeekChart(entries), [entries, range]);
  const chartMax = Math.max(...chartData.map((item) => item.value), 1);
  const peakValue = Math.max(...chartData.map((item) => item.value), 0);
  const peakLabel = chartData.find((item) => item.value === peakValue)?.label;
  const avatarLetter = user?.name?.trim().charAt(0).toUpperCase() || "S";

  return (
    <ScreenContainer containerClassName="bg-[#F8F6F0]" safeAreaClassName="bg-[#F8F6F0]">
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshEntries} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileHeading}><Text style={styles.eyebrow}>KENDİNE DÖN</Text><Text style={styles.title}>Profilin</Text>{user?.name ? <Text style={styles.userName}>{user.name}</Text> : null}{user?.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}</View>
          <View style={styles.headerRight}>{user?.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} /> : <View style={styles.avatar}><Text style={styles.avatarText}>{avatarLetter}</Text></View>}<AppTopActions /></View>
        </View>

        <View style={styles.quoteCard}>
          <View style={styles.quoteIcon}><Ionicons name="sparkles" size={19} color={colors.orange} /></View>
          <View style={styles.quoteCopy}><Text style={styles.quoteTitle}>Şükür biriktikçe çoğalır.</Text><Text style={styles.quoteText}>Bugün kendin için ayırdığın bu küçük an çok değerli.</Text></View>
        </View>

        <View style={styles.sectionRow}>
          <View><Text style={styles.sectionTitle}>Bulut yedeği</Text><Text style={styles.sectionSubtitle}>{isAuthenticated ? "Hesabınla güvenle saklanıyor" : "Cihazlar arasında kullanmak için giriş yap"}</Text></View>
          <Pressable onPress={syncToCloud} style={({ pressed }) => [styles.syncButton, pressed && styles.pressed]}>
            <Ionicons name={isAuthenticated ? "cloud-done-outline" : "log-in-outline"} size={15} color={colors.primary} />
            <Text style={styles.syncText}>{syncState === "syncing" ? "Yükleniyor" : isAuthenticated ? "Senkronize et" : "Giriş yap"}</Text>
          </Pressable>
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.reminderIcon}><Ionicons name="notifications-outline" size={19} color={colors.orange} /></View>
          <View style={styles.reminderCopy}><Text style={styles.reminderTitle}>Şükür hatırlatıcısı</Text><Text style={styles.reminderText}>{reminder.enabled ? `Her gün ${formatReminderTime(reminder)} · saati değiştirmek için dokun` : "Her gün küçük bir mola için hatırlat"}</Text></View>
          <Pressable onPress={cycleReminderTime} style={({ pressed }) => [styles.timeButton, pressed && styles.pressed]}><Text style={styles.timeText}>{formatReminderTime(reminder)}</Text></Pressable>
          <Pressable onPress={toggleReminder} style={({ pressed }) => [styles.switch, reminder.enabled && styles.switchOn, pressed && styles.pressed]} accessibilityRole="switch" accessibilityState={{ checked: reminder.enabled }}><View style={[styles.switchKnob, reminder.enabled && styles.switchKnobOn]} /></Pressable>
        </View>

        <Text style={[styles.sectionTitle, styles.summaryTitle]}>Özet</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.primarySoft }]}><View style={styles.statIconGreen}><Ionicons name="sunny-outline" size={17} color={colors.primary} /></View><Text style={styles.statValue}>{todayCount}</Text><Text style={styles.statLabel}>Bugün</Text></View>
          <View style={[styles.statCard, { backgroundColor: colors.orangeSoft }]}><View style={styles.statIconOrange}><Ionicons name="calendar-outline" size={17} color={colors.orange} /></View><Text style={styles.statValue}>{weekCount}</Text><Text style={styles.statLabel}>Bu hafta</Text></View>
          <View style={[styles.statCard, { backgroundColor: "#EEF0FA" }]}><View style={styles.statIconPurple}><Ionicons name="stats-chart-outline" size={17} color="#6672B8" /></View><Text style={styles.statValue}>{monthCount}</Text><Text style={styles.statLabel}>Bu ay</Text></View>
        </View>

        <View style={styles.chartHeader}><View><Text style={styles.sectionTitle}>Şükür ritmin</Text><Text style={styles.chartSubtitle}>Eklediğin maddelerin dağılımı</Text></View><View style={styles.chartBadge}><Ionicons name="trending-up" size={14} color={colors.primary} /><Text style={styles.chartBadgeText}>{entries.length} toplam</Text></View></View>
        <View style={styles.chartCard}>
          <View style={styles.rangeSwitcher}>{(["day", "week", "month"] as ChartRange[]).map((item) => { const labels = { day: "Gün", week: "Hafta", month: "Ay" }; const active = range === item; return <Pressable key={item} onPress={() => setRange(item)} style={({ pressed }) => [styles.rangeButton, active && styles.rangeButtonActive, pressed && styles.pressed]}><Text style={[styles.rangeText, active && styles.rangeTextActive]}>{labels[item]}</Text></Pressable>; })}</View>
          <View style={styles.chartArea}>{chartData.map((item, index) => { const barHeight = item.value === 0 ? 8 : Math.max(18, Math.round((item.value / chartMax) * 116)); const isPeak = peakValue > 0 && item.value === peakValue; return <View key={`${item.label}-${index}`} style={styles.barColumn}><View style={styles.barTrack}><View style={[styles.bar, { height: barHeight }, isPeak && styles.barPeak]} /></View><Text style={[styles.barValue, isPeak && styles.barValuePeak]}>{item.value}</Text><Text style={styles.barLabel}>{item.label}</Text></View>; })}</View>
          <View style={styles.chartFooter}><Text style={styles.chartFooterText}>{peakValue > 0 ? `En yoğun gün: ${peakLabel}` : "Henüz grafik oluşmadı"}</Text><Ionicons name="leaf-outline" size={17} color={colors.primary} /></View>
        </View>

        <View style={styles.insightCard}><View style={styles.insightIcon}><Ionicons name="heart-outline" size={20} color={colors.orange} /></View><View style={styles.insightCopy}><Text style={styles.insightTitle}>{todayCount > 0 ? "Bugünkü şükrün burada." : "Bugün için bir alan aç."}</Text><Text style={styles.insightText}>{todayCount > 0 ? `${formatDate(new Date())} tarihinde ${todayCount} madde ekledin.` : "Ana sayfadan ilk şükür maddeni ekleyerek ritmini başlatabilirsin."}</Text></View></View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 34 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  headerRight: { alignItems: "center", flexDirection: "row", gap: 8 },
  profileHeading: { flex: 1 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.8, marginBottom: 4 },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", letterSpacing: -0.8 },
  avatar: { alignItems: "center", backgroundColor: colors.ink, borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  avatarText: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  avatarImage: { borderRadius: 22, height: 44, width: 44 },
  userName: { color: colors.ink, fontSize: 13, fontWeight: "800", marginTop: 7 },
  userEmail: { color: colors.muted, fontSize: 10, marginTop: 2 },
  quoteCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 22, borderWidth: 1, flexDirection: "row", marginBottom: 21, padding: 17 },
  quoteIcon: { alignItems: "center", backgroundColor: colors.orangeSoft, borderRadius: 16, height: 34, justifyContent: "center", marginRight: 13, width: 34 },
  quoteCopy: { flex: 1 },
  quoteTitle: { color: colors.ink, fontSize: 15, fontWeight: "800", marginBottom: 4 },
  quoteText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  sectionRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 11 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  sectionSubtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
  syncButton: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 11, flexDirection: "row", gap: 5, paddingHorizontal: 10, paddingVertical: 8 },
  syncText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  reminderCard: { alignItems: "center", backgroundColor: "#F1EDE2", borderRadius: 19, flexDirection: "row", marginBottom: 24, padding: 13 },
  reminderIcon: { alignItems: "center", backgroundColor: "#FCE1CB", borderRadius: 15, height: 34, justifyContent: "center", marginRight: 10, width: 34 },
  reminderCopy: { flex: 1, marginRight: 5 },
  reminderTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  reminderText: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  timeButton: { backgroundColor: colors.surface, borderRadius: 8, marginRight: 6, paddingHorizontal: 7, paddingVertical: 6 },
  timeText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
  switch: { backgroundColor: "#CFD5D0", borderRadius: 12, height: 24, justifyContent: "center", padding: 2, width: 42 },
  switchOn: { backgroundColor: colors.primary },
  switchKnob: { backgroundColor: colors.surface, borderRadius: 10, height: 20, width: 20 },
  switchKnobOn: { alignSelf: "flex-end" },
  summaryTitle: { marginBottom: 12 },
  statsGrid: { flexDirection: "row", gap: 9 },
  statCard: { borderRadius: 18, flex: 1, minHeight: 108, padding: 13 },
  statIconGreen: { alignItems: "center", backgroundColor: "#CFE7DA", borderRadius: 9, height: 28, justifyContent: "center", width: 28 },
  statIconOrange: { alignItems: "center", backgroundColor: "#FFE1CF", borderRadius: 9, height: 28, justifyContent: "center", width: 28 },
  statIconPurple: { alignItems: "center", backgroundColor: "#DDE1F6", borderRadius: 9, height: 28, justifyContent: "center", width: 28 },
  statValue: { color: colors.ink, fontSize: 25, fontWeight: "800", marginTop: 8 },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: "600", marginTop: 1 },
  chartHeader: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", marginBottom: 12, marginTop: 28 },
  chartSubtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
  chartBadge: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 12, flexDirection: "row", gap: 5, paddingHorizontal: 9, paddingVertical: 6 },
  chartBadgeText: { color: colors.primary, fontSize: 11, fontWeight: "700" },
  chartCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 22, borderWidth: 1, padding: 16 },
  rangeSwitcher: { alignSelf: "flex-start", backgroundColor: "#F3F5F1", borderRadius: 11, flexDirection: "row", padding: 3 },
  rangeButton: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  rangeButtonActive: { backgroundColor: colors.surface, shadowColor: colors.ink, shadowOffset: { height: 1, width: 0 }, shadowOpacity: 0.08, shadowRadius: 3 },
  rangeText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  rangeTextActive: { color: colors.ink },
  chartArea: { alignItems: "flex-end", flexDirection: "row", height: 182, justifyContent: "space-between", paddingTop: 20 },
  barColumn: { alignItems: "center", flex: 1, height: 158, justifyContent: "flex-end" },
  barTrack: { alignItems: "center", height: 122, justifyContent: "flex-end", width: "100%" },
  bar: { backgroundColor: "#B9DCC8", borderRadius: 7, minHeight: 8, width: 18 },
  barPeak: { backgroundColor: colors.primary },
  barValue: { color: colors.muted, fontSize: 10, fontWeight: "700", marginTop: 5 },
  barValuePeak: { color: colors.primary },
  barLabel: { color: colors.muted, fontSize: 10, marginTop: 4, textTransform: "capitalize" },
  chartFooter: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 14, paddingTop: 13 },
  chartFooterText: { color: colors.muted, fontSize: 11, fontWeight: "600" },
  insightCard: { alignItems: "center", backgroundColor: "#F1EDE2", borderRadius: 20, flexDirection: "row", marginTop: 18, padding: 15 },
  insightIcon: { alignItems: "center", backgroundColor: "#FCE1CB", borderRadius: 16, height: 34, justifyContent: "center", marginRight: 12, width: 34 },
  insightCopy: { flex: 1 },
  insightTitle: { color: colors.ink, fontSize: 13, fontWeight: "800", marginBottom: 3 },
  insightText: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
