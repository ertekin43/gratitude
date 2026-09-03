import fs from 'node:fs';
const path = 'app/settings.tsx';
let text = fs.readFileSync(path, 'utf8');
text = text.replace('import { ambiencePresets } from "@/lib/ambience-presets";\n', '');
text = text.split('\n').filter((line) => !line.includes('ambiencePresets.map')).join('\n');
fs.writeFileSync(path, text);
