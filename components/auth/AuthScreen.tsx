import images from "@/constants/images";
import { styled } from "nativewind";
import React, { type ReactNode } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  eyebrow?: string;
};

const AuthScreen = ({
  title,
  subtitle,
  children,
  footer,
  eyebrow = "Your subscription rhythm, simplified",
}: AuthScreenProps) => {
  return (
    <SafeAreaView className="auth-safe-area">
      <View className="auth-screen">
        <Image
          source={images.splashPattern}
          resizeMode="contain"
          className="absolute -right-18 -top-6 h-72 w-72 opacity-90"
        />

        <ScrollView
          className="auth-scroll"
          contentContainerClassName="grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            <View className="auth-brand-block items-start">
              <View className="auth-logo-wrap self-start">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>

                <View>
                  <Text className="auth-wordmark">Recurrly</Text>
                  <Text className="auth-wordmark-sub">Spend visibility</Text>
                </View>
              </View>

              <View className="max-w-[320px] gap-2">
                <Text className="text-xs font-sans-semibold uppercase tracking-[1.4px] text-accent">
                  {eyebrow}
                </Text>
                <Text className="auth-title">{title}</Text>
                <Text className="text-base font-sans-medium leading-6 text-muted-foreground">
                  {subtitle}
                </Text>
              </View>
            </View>

            <View className="auth-card mt-7">
              <View className="mb-5 rounded-[28px] bg-muted px-4 py-4">
                <Text className="text-[11px] font-sans-semibold uppercase tracking-[1.4px] text-muted-foreground">
                  Built for calm money ops
                </Text>
                <Text className="mt-2 text-lg font-sans-bold text-primary">
                  Renewals, notices, and account access in one steady flow.
                </Text>
                <View className="mt-4 flex-row flex-wrap gap-2">
                  <View className="rounded-full bg-background px-3 py-2">
                    <Text className="text-xs font-sans-semibold text-primary">
                      Secure session
                    </Text>
                  </View>
                  <View className="rounded-full bg-background px-3 py-2">
                    <Text className="text-xs font-sans-semibold text-primary">
                      Quick access
                    </Text>
                  </View>
                  <View className="rounded-full bg-background px-3 py-2">
                    <Text className="text-xs font-sans-semibold text-primary">
                      Zero clutter
                    </Text>
                  </View>
                </View>
              </View>

              {children}
            </View>

            {footer}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AuthScreen;
