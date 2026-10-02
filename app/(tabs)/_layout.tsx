import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { ritual } from "@/lib/design-system";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: ritual.green,
        tabBarInactiveTintColor: "#809087",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: ritual.ivory,
          borderTopColor: ritual.line,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: "Geçmiş",
          tabBarIcon: ({ color }) => <Ionicons size={23} name="book-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Yaz",
          tabBarIcon: ({ color }) => <Ionicons size={23} name="create-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Hatırla",
          tabBarIcon: ({ color }) => <Ionicons size={23} name="heart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Sen",
          tabBarIcon: ({ color }) => <Ionicons size={23} name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
