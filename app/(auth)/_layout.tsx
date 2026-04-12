import "@/global.css";
import { Stack } from "expo-router";

import AuthGate from "@/components/auth/AuthGate";

export default function RootLayout() {
  return (
    <AuthGate
      mode="guest"
      loadingTitle="Checking access"
      loadingMessage="Making sure you land in the right place."
    >
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGate>
  );
}
