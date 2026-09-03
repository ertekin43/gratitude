import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, StyleSheet, View } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import { loadPreferences } from "@/lib/app-preferences";
import { SchemeColors, type ColorScheme } from "@/constants/theme";

type ThemeContextValue = { colorScheme: ColorScheme; themeName: string; setColorScheme: (scheme: ColorScheme) => void; setThemeName: (name: string) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
const themePalettes: Record<string, Record<string, string>> = {
  "Adaçayı": { primary: "#2F7D5A", background: "#F8F6F0", surface: "#FFFFFF", foreground: "#163B2B", muted: "#7B8A82", border: "#E1E8E2", success: "#4E9B72", warning: "#E9A55E", error: "#C75C51" },
  "Günışığı": { primary: "#D17A22", background: "#FFF8EA", surface: "#FFFFFF", foreground: "#4B3018", muted: "#927B67", border: "#F2DFC5", success: "#649B53", warning: "#D17A22", error: "#C85B4F" },
  "Okyanus": { primary: "#167D9A", background: "#EFF9FC", surface: "#FFFFFF", foreground: "#123B4B", muted: "#6D8992", border: "#D7EDF2", success: "#3C9C91", warning: "#D99B52", error: "#C75C65" },
  "Lavanta": { primary: "#7656A8", background: "#F7F3FC", surface: "#FFFFFF", foreground: "#302348", muted: "#857B98", border: "#E8DFF3", success: "#5E9B77", warning: "#D8955C", error: "#C96767" },
  "Gül Kurusu": { primary: "#B65F72", background: "#FFF5F6", surface: "#FFFFFF", foreground: "#4D2730", muted: "#987A80", border: "#F0DDE1", success: "#699A76", warning: "#D8925C", error: "#B9535B" },
  "Gece": { primary: "#79C8A1", background: "#14241F", surface: "#1F342C", foreground: "#EEF8F1", muted: "#A4B9AD", border: "#355346", success: "#79C8A1", warning: "#E0B36D", error: "#ED8A82" },
  "Kum": { primary: "#9D7145", background: "#FBF5EA", surface: "#FFFFFF", foreground: "#3E3023", muted: "#8B7A68", border: "#EBDDC8", success: "#6B986D", warning: "#C99454", error: "#BC6658" },
  "Orman": { primary: "#416B3F", background: "#F1F7EF", surface: "#FFFFFF", foreground: "#213B25", muted: "#708474", border: "#D9E8D5", success: "#5C9A67", warning: "#C99655", error: "#C45D55" },
  "Gökyüzü": { primary: "#477EB8", background: "#F1F7FE", surface: "#FFFFFF", foreground: "#203650", muted: "#71869B", border: "#DCE9F6", success: "#5D9A86", warning: "#D79A55", error: "#C45B62" },
  "Şeftali": { primary: "#D87855", background: "#FFF5EF", surface: "#FFFFFF", foreground: "#4C2D23", muted: "#967D73", border: "#F0DDD3", success: "#6C9B72", warning: "#D38B45", error: "#C55E55" },
};
function paletteFor(name: string, scheme: ColorScheme) { return themePalettes[name] || SchemeColors[scheme]; }
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = "light" as ColorScheme; const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme); const [themeName, setThemeNameState] = useState("Adaçayı");
  useEffect(() => { loadPreferences().then((preferences) => { setThemeNameState(preferences.theme); setColorSchemeState(preferences.theme === "Gece" ? "dark" : "light"); }); }, []);
  const setThemeName = useCallback((name: string) => { setThemeNameState(name); const scheme = name === "Gece" ? "dark" : "light"; setColorSchemeState(scheme); nativewindColorScheme.set(scheme); Appearance.setColorScheme?.(scheme); }, []);
  const setColorScheme = useCallback((scheme: ColorScheme) => { setColorSchemeState(scheme); nativewindColorScheme.set(scheme); Appearance.setColorScheme?.(scheme); }, []);
  const palette = paletteFor(themeName, colorScheme);
  useEffect(() => { nativewindColorScheme.set(colorScheme); if (typeof document !== "undefined") { const root = document.documentElement; root.dataset.theme = themeName; root.classList.toggle("dark", colorScheme === "dark"); Object.entries(palette).forEach(([token, value]) => root.style.setProperty(`--color-${token}`, value)); } }, [colorScheme, palette, themeName]);
  const themeVariables = useMemo(() => vars(Object.fromEntries(Object.entries(palette).map(([key, value]) => [`color-${key}`, value]))), [palette]);
  const value = useMemo(() => ({ colorScheme, themeName, setColorScheme, setThemeName }), [colorScheme, themeName, setColorScheme, setThemeName]);
  return <ThemeContext.Provider value={value}><View style={[{ flex: 1 }, themeVariables]}>{children}<View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: palette.primary, opacity: 0.035 }]} /></View></ThemeContext.Provider>;
}
export function useThemeContext(): ThemeContextValue { const ctx = useContext(ThemeContext); if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider"); return ctx; }
