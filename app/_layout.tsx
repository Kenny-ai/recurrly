import "@/global.css";
import { Stack } from "expo-router";

/** Prefer home (tabs) over `(auth)` on native cold start — see app/index.tsx */
export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
