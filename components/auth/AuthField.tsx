import { colors } from "@/constants/theme";
import { clsx } from "clsx";
import React from "react";
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helper?: string;
  trailingLabel?: string;
  onTrailingPress?: () => void;
};

const AuthField = ({
  label,
  error,
  helper,
  trailingLabel,
  onTrailingPress,
  ...inputProps
}: AuthFieldProps) => {
  return (
    <View className="auth-field">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="auth-label">{label}</Text>
        {helper ? <Text className="auth-helper">{helper}</Text> : null}
      </View>

      <View className="relative">
        <TextInput
          className={clsx(
            "auth-input",
            error && "auth-input-error",
            trailingLabel && "pr-18",
          )}
          placeholderTextColor={colors.mutedForeground}
          {...inputProps}
        />

        {trailingLabel ? (
          <Pressable
            className="absolute right-4 top-4"
            hitSlop={10}
            onPress={onTrailingPress}
          >
            <Text className="text-xs font-sans-bold text-accent">
              {trailingLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
};

export default AuthField;
