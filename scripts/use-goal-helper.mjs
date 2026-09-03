import fs from 'node:fs';
const path = 'app/(tabs)/index.tsx'; let text = fs.readFileSync(path, 'utf8'); text = text.replace('todayEntries.length / Math.max(dailyGoal, 1)', 'getGoalProgress(todayEntries.length, dailyGoal)'); fs.writeFileSync(path, text);
