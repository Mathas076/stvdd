import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, StyleSheet, Platform } from "react-native";

const TAB_CONFIG = [
  { name: "index", title: "Inicio", icon: "home", iconOutline: "home-outline" },
  { name: "explore", title: "Explorar", icon: "compass", iconOutline: "compass-outline" },
  { name: "profile", title: "Perfil", icon: "person", iconOutline: "person-outline" },
] as const;

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#0F172A",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ focused, color }) => {
          const tab = TAB_CONFIG.find((t) => t.name === route.name);
          if (!tab) return null;
          const iconName = focused ? tab.icon : tab.iconOutline;
          return (
            <View style={[styles.iconWrapper, focused && styles.iconActive]}>
              <Ionicons name={iconName as any} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    height: Platform.OS === "ios" ? 84 : 64,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconActive: {
    backgroundColor: "#F1F5F9",
  },
})