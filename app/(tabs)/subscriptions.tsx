import SubscriptionCard from "@/components/SubscriptionCard";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { styled } from "nativewind";
import React, { useDeferredValue, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = deferredSearchQuery.trim().toLowerCase();

  const filteredSubscriptions = HOME_SUBSCRIPTIONS.filter((subscription) => {
    if (!normalizedSearchQuery) {
      return true;
    }

    return [
      subscription.name,
      subscription.category,
      subscription.plan,
      subscription.billing,
      subscription.status,
      subscription.paymentMethod,
    ].some((value) => value?.toLowerCase().includes(normalizedSearchQuery));
  });

  const resultLabel = normalizedSearchQuery
    ? `Showing ${filteredSubscriptions.length} of ${HOME_SUBSCRIPTIONS.length}`
    : `${HOME_SUBSCRIPTIONS.length} subscriptions`;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="mb-6 gap-5">
        <View>
          <Text className="text-3xl font-sans-bold text-primary">
            Subscriptions
          </Text>
          <Text className="mt-2 text-base font-sans-medium leading-6 text-muted-foreground">
            Search by name, category, plan, billing cycle, status, or payment
            method.
          </Text>
        </View>

        <View className="rounded-[28px] border border-border bg-card p-4">
          <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
            Search subscriptions
          </Text>

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Try Spotify, design, yearly..."
            placeholderTextColor="rgba(0, 0, 0, 0.45)"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="mt-3 py-1 text-base font-sans-medium text-primary"
          />

          <View className="mt-4 flex-row items-center justify-between gap-3">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              {resultLabel}
            </Text>

            {searchQuery ? (
              <Pressable
                onPress={() => setSearchQuery("")}
                className="rounded-full border border-border px-4 py-2"
              >
                <Text className="text-sm font-sans-semibold text-primary">
                  Clear
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <FlatList
        className="flex-1"
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="grow pb-30"
        ListEmptyComponent={
          <View className="rounded-[28px] border border-dashed border-border bg-card p-5">
            <Text className="text-lg font-sans-bold text-primary">
              No subscriptions found
            </Text>
            <Text className="mt-2 text-sm font-sans-medium leading-6 text-muted-foreground">
              {normalizedSearchQuery
                ? `No results for \"${searchQuery.trim()}\". Try a different keyword.`
                : "No subscriptions are available right now."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
