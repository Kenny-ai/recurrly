import images from "@/constants/images";
import { colors } from "@/constants/theme";
import { styled } from "nativewind";
import React from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

type AuthLoadingScreenProps = {
  title?: string;
  message?: string;
};

const AuthLoadingScreen = ({
  title = "Getting your workspace ready",
  message = "Checking your session and loading the right screen.",
}: AuthLoadingScreenProps) => {
  return (
    <SafeAreaView className="auth-safe-area">
      <View className="flex-1 items-center justify-center px-8">
        <Image
          source={images.splashPattern}
          resizeMode="contain"
          className="absolute -top-10 right-0 h-72 w-72 opacity-90"
        />
        <View className="w-full max-w-[320px] rounded-4xl border border-border bg-card px-6 py-8">
          <ActivityIndicator color={colors.accent} size="large" />
          <Text className="mt-5 text-center text-2xl font-sans-bold text-primary">
            {title}
          </Text>
          <Text className="mt-2 text-center text-base font-sans-medium leading-6 text-muted-foreground">
            {message}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AuthLoadingScreen;
