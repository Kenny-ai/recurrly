import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import React, { type ReactNode } from "react";

import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import { AUTH_HOME_ROUTE, AUTH_SIGN_IN_ROUTE } from "@/lib/auth";

type AuthGateProps = {
  mode: "guest" | "protected";
  children: ReactNode;
  loadingTitle?: string;
  loadingMessage?: string;
};

const AuthGate = ({
  mode,
  children,
  loadingTitle,
  loadingMessage,
}: AuthGateProps) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AuthLoadingScreen title={loadingTitle} message={loadingMessage} />;
  }

  if (mode === "guest" && isSignedIn) {
    return <Redirect href={AUTH_HOME_ROUTE} />;
  }

  if (mode === "protected" && !isSignedIn) {
    return <Redirect href={AUTH_SIGN_IN_ROUTE} />;
  }

  return <>{children}</>;
};

export default AuthGate;
