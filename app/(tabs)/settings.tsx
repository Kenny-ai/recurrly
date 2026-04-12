import AuthButton from "@/components/auth/AuthButton";
import AuthLoadingScreen from "@/components/auth/AuthLoadingScreen";
import images from "@/constants/images";
import {
  AUTH_SIGN_IN_ROUTE,
  getUserDisplayName,
  getUserEmail,
} from "@/lib/auth";
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const router = useRouter();
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <AuthLoadingScreen
        title="Opening your account"
        message="Fetching your profile details."
      />
    );
  }

  const displayName = getUserDisplayName(user);
  const emailAddress = getUserEmail(user);
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      setSignOutError(null);
      await signOut();
      router.replace(AUTH_SIGN_IN_ROUTE);
    } catch (error) {
      setSignOutError(
        error instanceof Error && error.message
          ? error.message
          : "We couldn't sign you out right now. Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="mt-6 gap-5">
        <View>
          <Text className="text-3xl font-sans-bold text-primary">Account</Text>
          <Text className="mt-2 text-base font-sans-medium leading-6 text-muted-foreground">
            Manage the workspace tied to your recurring spend dashboard.
          </Text>
        </View>

        <View className="rounded-[28px] border border-border bg-card p-5">
          <View className="flex-row items-center gap-4">
            <Image source={avatarSource} className="size-18 rounded-full" />

            <View className="min-w-0 flex-1 gap-1">
              <Text
                className="text-xl font-sans-bold text-primary"
                numberOfLines={1}
              >
                {displayName}
              </Text>
              <Text
                className="text-sm font-sans-semibold text-muted-foreground"
                numberOfLines={1}
              >
                {emailAddress ?? "Email address not available"}
              </Text>
            </View>
          </View>

          <View className="mt-5 gap-3 rounded-3xl bg-muted p-4">
            <View className="flex-row items-center justify-between gap-4">
              <Text className="text-sm font-sans-semibold text-muted-foreground">
                Session
              </Text>
              <Text className="text-sm font-sans-bold text-primary">
                Active
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-4">
              <Text className="text-sm font-sans-semibold text-muted-foreground">
                Workspace
              </Text>
              <Text className="text-sm font-sans-bold text-primary">
                Personal
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-4">
              <Text className="text-sm font-sans-semibold text-muted-foreground">
                Device storage
              </Text>
              <Text className="text-sm font-sans-bold text-primary">
                Secure
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-[28px] border border-border bg-card p-5">
          <Text className="text-lg font-sans-bold text-primary">
            Session control
          </Text>
          <Text className="mt-2 text-sm font-sans-medium leading-6 text-muted-foreground">
            Signing out clears this device session and returns you to the access
            flow.
          </Text>

          <View className="mt-5">
            <AuthButton
              label={isSigningOut ? "Signing out..." : "Sign out"}
              loading={isSigningOut}
              onPress={handleSignOut}
            />
          </View>

          {signOutError ? (
            <View className="mt-4 rounded-2xl bg-destructive/10 p-3">
              <Text className="text-sm font-sans-semibold text-destructive">
                {signOutError}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
