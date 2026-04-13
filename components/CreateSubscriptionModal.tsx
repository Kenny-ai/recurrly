import AuthButton from "@/components/auth/AuthButton";
import AuthField from "@/components/auth/AuthField";
import { icons } from "@/constants/icons";
import { clsx } from "clsx";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const FREQUENCY_OPTIONS = ["Monthly", "Yearly"] as const;
const CATEGORY_OPTIONS = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type FrequencyOption = (typeof FREQUENCY_OPTIONS)[number];
type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateSubscription: (subscription: Subscription) => void;
};

type FieldErrors = {
  name?: string;
  price?: string;
};

const CATEGORY_COLORS: Record<CategoryOption, string> = {
  Entertainment: "#ffd8b1",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#b8e8d0",
  Cloud: "#d2e7ff",
  Music: "#ffd7df",
  Other: "#e9dfc7",
};

const buildSubscriptionId = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "subscription"}-${Date.now()}`;
};

const parsePrice = (value: string) =>
  Number.parseFloat(value.replace(/,/g, "."));

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreateSubscription,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<FrequencyOption>("Monthly");
  const [category, setCategory] = useState<CategoryOption>("Entertainment");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const trimmedName = name.trim();
  const trimmedPrice = price.trim();
  const shouldDisableSubmit = !trimmedName || !trimmedPrice;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setFieldErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const priceValue = parsePrice(trimmedPrice);
    const nextErrors: FieldErrors = {};

    if (!trimmedName) {
      nextErrors.name = "Name is required.";
    }

    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      nextErrors.price = "Enter a positive price.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const startDate = dayjs();
    const renewalDate =
      frequency === "Monthly"
        ? startDate.add(1, "month")
        : startDate.add(1, "year");

    onCreateSubscription({
      id: buildSubscriptionId(trimmedName),
      name: trimmedName,
      price: priceValue,
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.wallet,
      billing: frequency,
      currency: "USD",
      color: CATEGORY_COLORS[category],
    });

    handleClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
    >
      <View className="modal-overlay justify-end">
        <Pressable className="absolute inset-0" onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="modal-container overflow-hidden">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>

              <Pressable
                onPress={handleClose}
                className="modal-close"
                hitSlop={10}
              >
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="modal-body">
                <View className="rounded-[28px] border border-border bg-card p-5">
                  <View className="auth-form">
                    <AuthField
                      label="Name"
                      placeholder="Netflix, Figma, GitHub Pro..."
                      value={name}
                      onChangeText={(value) => {
                        setName(value);
                        setFieldErrors((current) => ({
                          ...current,
                          name: undefined,
                        }));
                      }}
                      error={fieldErrors.name}
                      returnKeyType="next"
                    />

                    <AuthField
                      label="Price"
                      placeholder="12.99"
                      value={price}
                      onChangeText={(value) => {
                        setPrice(value.replace(/[^0-9.,]/g, ""));
                        setFieldErrors((current) => ({
                          ...current,
                          price: undefined,
                        }));
                      }}
                      error={fieldErrors.price}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                    />

                    <View className="auth-field">
                      <Text className="auth-label">Frequency</Text>

                      <View className="picker-row">
                        {FREQUENCY_OPTIONS.map((option) => {
                          const isActive = frequency === option;

                          return (
                            <Pressable
                              key={option}
                              onPress={() => setFrequency(option)}
                              className={clsx(
                                "picker-option",
                                isActive && "picker-option-active",
                              )}
                            >
                              <Text
                                className={clsx(
                                  "picker-option-text",
                                  isActive && "picker-option-text-active",
                                )}
                              >
                                {option}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <View className="auth-field">
                      <Text className="auth-label">Category</Text>

                      <View className="category-scroll">
                        {CATEGORY_OPTIONS.map((option) => {
                          const isActive = category === option;

                          return (
                            <Pressable
                              key={option}
                              onPress={() => setCategory(option)}
                              className={clsx(
                                "category-chip",
                                isActive && "category-chip-active",
                              )}
                            >
                              <Text
                                className={clsx(
                                  "category-chip-text",
                                  isActive && "category-chip-text-active",
                                )}
                              >
                                {option}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <AuthButton
                      label="Create subscription"
                      disabled={shouldDisableSubmit}
                      onPress={handleSubmit}
                    />

                    <Text className="text-center text-sm font-sans-medium leading-6 text-muted-foreground">
                      The first renewal date is calculated automatically from
                      the billing frequency you select.
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CreateSubscriptionModal;
