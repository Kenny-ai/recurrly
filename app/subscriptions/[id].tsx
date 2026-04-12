import { Link, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

import AuthGate from "@/components/auth/AuthGate";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AuthGate
      mode="protected"
      loadingTitle="Opening subscription"
      loadingMessage="Checking your access before showing details."
    >
      <View className="flex-1 bg-background p-6">
        <Text className="mt-20 text-2xl font-sans-bold text-primary">
          SubscriptionDetails: {id}
        </Text>

        <Link
          href="/(tabs)/subscriptions"
          className="mt-4 text-base font-sans-semibold text-accent"
        >
          Go Back
        </Link>
      </View>
    </AuthGate>
  );
};

export default SubscriptionDetails;
