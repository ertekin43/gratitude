import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
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
  type GratitudeEntry,
} from "@/lib/gratitude";

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
};

type ChartRange = "day" | "week" | "month";

function formatDate(date: Date) {
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

export default function ProfileScreen() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [range, setRange] = useState<ChartRange>("week");
  const [refreshing, setRefreshing] = useState(false);

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

  const todayCount = useMemo(() => entries.filter((entry) => isToday(new Date(entry.createdAt))).length, [entries]);
  const weekCount = useMemo(() => entries.filter((entry) => isWithinCurrentWeek(new Date(entry.createdAt))).length, [entries]);
  const monthCount = useMemo(() => entries.filter((entry) => isWithinCurrentMonth(new Date(entry.createdAt))).length, [entries]);

  const chartData = useMemo(() => {
    if (range === "day") return getDayChart(entries);
    if (range === "month") return getMonthChart(entries);
    return getWeekChart(entries);
  }, [entries, range]);

  const chartMax = Math.max(...chartData.map((item) => item.value), 1);
  const peakValue = Math.max(...chartData.map((item) => item.value), 0);
  const peakLabel = chartData.find((item) => item.value === peakValue)?.label;

  return (
    <ScreenContainer containerClassName="bg-[#F8F6F0]" safeAreaClassName="bg-[#F8F6F0]">
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshEntries} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>KENDİNE DÖN</Text>
            <Text style={styles.title}>Profilin</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
        </View>

        <View style={styles.quoteCard}>
          <View style={styles.quoteIcon}>
            <Ionicons name="sparkles" size={19} color={colors.orange} />
          </View>
          <View style={styles.quoteCopy}>
            <Text style={styles.quoteTitle}>Şükür biriktikçe çoğalır.</Text>
            <Text style={styles.quoteText}>Bugün kendin için ayırdığın bu küçük an çok değerli.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Özet</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.primarySoft }]}>
            <View style={styles.statIconGreen}>
              <Ionicons name="sunny-outline" size={17} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{todayCount}</Text>
            <Text style={styles.statLabel}>Bugün</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.orangeSoft }]}>
            <View style={styles.statIconOrange}>
              <Ionicons name="calendar-outline" size={17} color={colors.orange} />
            </View>
            <Text style={styles.statValue}>{weekCount}</Text>
            <Text style={styles.statLabel}>Bu hafta</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#EEF0FA" }]}>
            <View style={styles.statIconPurple}>
              <Ionicons name="stats-chart-outline" size={17} color="#6672B8" />
            </View>
            <Text style={styles.statValue}>{monthCount}</Text>
            <Text style={styles.statLabel}>Bu ay</Text>
          </View>
        </View>

        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.sectionTitle}>Şükür ritmin</Text>
            <Text style={styles.chartSubtitle}>Eklediğin maddelerin dağılımı</Text>
          </View>
          <View style={styles.chartBadge}>
            <Ionicons name="trending-up" size={14} color={colors.primary} />
            <Text style={styles.chartBadgeText}>{entries.length} toplam</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.rangeSwitcher}>
            {(["day", "week", "month"] as ChartRange[]).map((item) => {
              const labels = { day: "Gün", week: "Hafta", month: "Ay" };
              const active = range === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setRange(item)}
                  style={({ pressed }) => [styles.rangeButton, active && styles.rangeButtonActive, pressed && styles.pressed]}
                >
                  <Text style={[styles.rangeText, active && styles.rangeTextActive]}>{labels[item]}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.chartArea}>
            {chartData.map((item, index) => {
              const barHeight = item.value === 0 ? 8 : Math.max(18, Math.round((item.value / chartMax) * 116));
              const isPeak = peakValue > 0 && item.value === peakValue;
              return (
                <View key={`${item.label}-${index}`} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: barHeight }, isPeak && styles.barPeak]} />
                  </View>
                  <Text style={[styles.barValue, isPeak && styles.barValuePeak]}>{item.value}</Text>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>{peakValue > 0 ? `En yoğun gün: ${peakLabel}` : "Henüz grafik oluşmadı"}</Text>
            <Ionicons name="leaf-outline" size={17} color={colors.primary} />
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons name="heart-outline" size={20} color={colors.orange} />
          </View>
          <View style={styles.insightCopy}>
            <Text style={styles.insightTitle}>{todayCount > 0 ? "Bugünkü şükrün burada." : "Bugün için bir alan aç."}</Text>
            <Text style={styles.insightText}>
              {todayCount > 0 ? `${formatDate(new Date())} tarihinde ${todayCount} madde ekledin.` : "Ana sayfadan ilk şükür maddeni ekleyerek ritmini başlatabilirsin."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 34,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  quoteCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 26,
    padding: 17,
  },
  quoteIcon: {
    alignItems: "center",
    backgroundColor: colors.orangeSoft,
    borderRadius: 16,
    height: 34,
    justifyContent: "center",
    marginRight: 13,
    width: 34,
  },
  quoteCopy: { flex: 1 },
  quoteTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  quoteText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
  },
  statCard: {
    borderRadius: 18,
    flex: 1,
    minHeight: 108,
    padding: 13,
  },
  statIconGreen: { alignItems: "center", backgroundColor: "#CFE7DA", borderRadius: 9, height: 28, justifyContent: "center", width: 28 },
  statIconOrange: { alignItems: "center", backgroundColor: "#FFE1CF", borderRadius: 9, height: 28, justifyContent: "center", width: 28 },
  statIconPurple: { alignItems: "center", backgroundColor: "#DDE1F6", borderRadius: 9, height: 28, justifyContent: "center", width: 28 },
  statValue: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "800",
    marginTop: 8,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },
  chartHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 28,
  },
  chartSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  chartBadge: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  chartBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  rangeSwitcher: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F5F1",
    borderRadius: 11,
    flexDirection: "row",
    padding: 3,
  },
  rangeButton: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  rangeButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: "#163B2B",
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  rangeText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  rangeTextActive: { color: colors.ink },
  pressed: { opacity: 0.72 },
  chartArea: {
    alignItems: "flex-end",
    flexDirection: "row",
    height: 182,
    justifyContent: "space-between",
    paddingTop: 20,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    height: 158,
    justifyContent: "flex-end",
  },
  barTrack: {
    alignItems: "center",
    height: 122,
    justifyContent: "flex-end",
    width: "100%",
  },
  bar: {
    backgroundColor: "#B9DCC8",
    borderRadius: 7,
    minHeight: 8,
    width: 18,
  },
  barPeak: { backgroundColor: colors.primary },
  barValue: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 5,
  },
  barValuePeak: { color: colors.primary },
  barLabel: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 4,
    textTransform: "capitalize",
  },
  chartFooter: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 13,
  },
  chartFooterText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  insightCard: {
    alignItems: "center",
    backgroundColor: "#F1EDE2",
    borderRadius: 20,
    flexDirection: "row",
    marginTop: 18,
    padding: 15,
  },
  insightIcon: {
    alignItems: "center",
    backgroundColor: "#FCE1CB",
    borderRadius: 16,
    height: 34,
    justifyContent: "center",
    marginRight: 12,
    width: 34,
  },
  insightCopy: { flex: 1 },
  insightTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 3,
  },
  insightText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
  },
});
