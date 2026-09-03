export const RANKS = [{ name: "Piyon", min: 0 }, { name: "At", min: 90 }, { name: "Fil", min: 180 }, { name: "Kale", min: 360 }, { name: "Vezir", min: 720 }, { name: "Şah", min: 1260 }] as const;
export function getRankForCount(count: number) { return [...RANKS].reverse().find((rank) => count >= rank.min) || RANKS[0]; }
export function getLevelForCount(count: number) { return Math.floor(Math.max(0, count) / 10) + 1; }
