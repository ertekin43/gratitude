import fs from 'node:fs';
const path = 'app/(tabs)/profile.tsx';
let text = fs.readFileSync(path, 'utf8');
const needle = '<Text style={styles.modalTitle}>Sana nasıl hitap edelim?</Text>';
const replacement = `${needle}<Pressable onPress={choosePhoto} style={styles.photoButton}><Ionicons name="camera-outline" size={16} color={colors.primary} /><Text style={styles.photoButtonText}>Profil fotoğrafını değiştir</Text></Pressable>`;
if (!text.includes(needle)) throw new Error('modal marker not found');
text = text.replace(needle, replacement);
text = text.replace('modalTitle: { color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: 5 },', 'modalTitle: { color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: 5 }, photoButton: { alignItems: "center", backgroundColor: colors.soft, borderRadius: 11, flexDirection: "row", gap: 7, marginTop: 14, paddingHorizontal: 11, paddingVertical: 10 }, photoButtonText: { color: colors.primary, fontSize: 11, fontWeight: "800" },');
fs.writeFileSync(path, text);
