import fs from 'node:fs';
const path = 'app/(tabs)/profile.tsx'; let text = fs.readFileSync(path, 'utf8');
text = text.replaceAll('rankFor(', 'getRankForCount(').replace('rank.icon', 'rankIcons[rank.name as keyof typeof rankIcons]').replace('ranks.find((item)', 'RANKS.find((item)');
text = text.replace('Math.floor(last21.length / 10) + 1', 'getLevelForCount(last21.length)');
fs.writeFileSync(path, text);
