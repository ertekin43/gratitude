import fs from 'node:fs';
const path = 'app/(tabs)/index.tsx'; let text = fs.readFileSync(path, 'utf8');
const oldValue = '(dailyGoal / Math.max(dailyGoal, todayEntries.length, 1)) * 100';
if (!text.includes(oldValue)) throw new Error('goal ratio not found');
text = text.replace(oldValue, '(todayEntries.length / Math.max(dailyGoal, 1)) * 100');
fs.writeFileSync(path, text);
