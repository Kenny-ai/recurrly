import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import { AUTH_HOME_ROUTE, AUTH_SIGN_IN_ROUTE } from "@/lib/auth";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <AuthLoadingScreen
        title="Opening your overview"
        message="Checking where to land you next."
      />
    );
  }

  return <Redirect href={isSignedIn ? AUTH_HOME_ROUTE : AUTH_SIGN_IN_ROUTE} />;
}
