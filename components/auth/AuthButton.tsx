import { colors } from "@/constants/theme";
import { clsx } from "clsx";
import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

type AuthButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

const AuthButton = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}: AuthButtonProps) => {
  const isPrimary = variant === "primary";
  const buttonClassName = isPrimary
    ? clsx("auth-button", (disabled || loading) && "auth-button-disabled")
    : clsx("auth-secondary-button", (disabled || loading) && "opacity-60");

  const textClassName = isPrimary
    ? "auth-button-text"
    : "auth-secondary-button-text";

  const handlePress = () => {
    Promise.resolve()
      .then(onPress)
      .catch((error) => {
        console.error("Auth button action failed", error);
      });
  };

  return (
    <Pressable
      className={buttonClassName}
      disabled={disabled || loading}
      onPress={handlePress}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.primary : colors.accent} />
      ) : (
        <Text className={textClassName}>{label}</Text>
      )}
    </Pressable>
  );
};

export default AuthButton;
