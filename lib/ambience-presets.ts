export type AmbiencePreset = { id: string; name: string; description: string; icon: "leaf-outline" | "flame-outline" | "water-outline" | "rainy-outline" | "infinite-outline" | "cloud-outline"; source: number };
export const ambiencePresets: AmbiencePreset[] = [
  { id: "forest", name: "Sakin orman", description: "Yapraklar ve uzak kuşlar", icon: "leaf-outline", source: require("@/assets/audio/forest.mp3") },
  { id: "fireplace", name: "Yumuşak şömine", description: "Sıcak çıtırtılar", icon: "flame-outline", source: require("@/assets/audio/fireplace.mp3") },
  { id: "ocean", name: "Deniz dalgaları", description: "Kıyıya vuran sakin dalgalar", icon: "water-outline", source: require("@/assets/audio/ocean.mp3") },
  { id: "rain", name: "Pencere yağmuru", description: "İnce ve huzurlu yağmur", icon: "rainy-outline", source: require("@/assets/audio/rain.mp3") },
  { id: "stream", name: "Dağ deresi", description: "Taşların üzerinden akan su", icon: "infinite-outline", source: require("@/assets/audio/stream.mp3") },
  { id: "wind", name: "Nazik rüzgar", description: "Çimenler arasında hafif esinti", icon: "cloud-outline", source: require("@/assets/audio/wind.mp3") },
];
export function getAmbienceSource(uri: string | null) { return ambiencePresets.find((item) => uri === `preset:${item.id}`)?.source ?? uri; }
