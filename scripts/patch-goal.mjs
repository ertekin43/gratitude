import fs from 'node:fs';
const path = 'app/(tabs)/index.tsx'; let text = fs.readFileSync(path, 'utf8');
text = text.replace('<Ionicons name="locate-outline" size={19} color={colors.primary} />', '<Ionicons name={todayEntries.length >= dailyGoal ? "checkmark-circle-outline" : "locate-outline"} size={19} color={colors.primary} />');
const marker = '<View style={[styles.goalFill, { width: `${Math.min(100, (todayEntries.length / Math.max(dailyGoal, todayEntries.length, 1)) * 100)}%` }]} />{todayEntries.length > dailyGoal ? <View style={[styles.goalMarker, { left: `${(dailyGoal / todayEntries.length) * 100}%` }]} /> : null}';
const replacement = '<View style={[styles.goalFill, { width: `${Math.min(100, (dailyGoal / Math.max(dailyGoal, todayEntries.length, 1)) * 100)}%` }]} />{todayEntries.length > dailyGoal ? <View style={[styles.goalOverflow, { width: `${((todayEntries.length - dailyGoal) / todayEntries.length) * 100}%` }]} /> : null}{todayEntries.length > dailyGoal ? <View style={[styles.goalMarker, { left: `${(dailyGoal / todayEntries.length) * 100}%` }]} /> : null}';
if (!text.includes(marker)) throw new Error('goal marker not found'); text = text.replace(marker, replacement);
text = text.replace('goalMarker:', 'goalOverflow: { backgroundColor: colors.primaryDark, borderRadius: 3, height: 7, position: "absolute", right: 0 }, goalMarker:'); fs.writeFileSync(path, text);
