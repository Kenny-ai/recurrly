import { isClerkAPIResponseError } from "@clerk/expo";
import type { Href, Router } from "expo-router";
import { Linking, Platform } from "react-native";

export const AUTH_HOME_ROUTE = "/(tabs)" as Href;
export const AUTH_SIGN_IN_ROUTE = "/(auth)/sign-in" as Href;
export const AUTH_SIGN_UP_ROUTE = "/(auth)/sign-up" as Href;

export type AuthFieldKey =
  | "emailAddress"
  | "password"
  | "confirmPassword"
  | "code"
  | "form";

export type AuthFieldErrors = Partial<Record<AuthFieldKey, string>>;

type UserLike = {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  primaryEmailAddress?: {
    emailAddress?: string | null;
  } | null;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmailAddress(value: string): string | undefined {
  if (!value.trim()) {
    return "Enter your email address.";
  }

  if (!emailPattern.test(value.trim())) {
    return "Enter a valid email address.";
  }

  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) {
    return "Enter a password.";
  }

  if (value.length < 8) {
    return "Use at least 8 characters.";
  }

  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "Use a mix of letters and numbers.";
  }

  return undefined;
}

export function validateVerificationCode(value: string): string | undefined {
  if (!value.trim()) {
    return "Enter the 6-digit code from your email.";
  }

  if (!/^\d{6}$/.test(value.trim())) {
    return "Use the 6-digit code from your email.";
  }

  return undefined;
}

export function validateSignInForm(values: {
  emailAddress: string;
  password: string;
}): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  const emailError = validateEmailAddress(values.emailAddress);
  if (emailError) {
    errors.emailAddress = emailError;
  }

  if (!values.password) {
    errors.password = "Enter your password.";
  }

  return errors;
}

export function validateSignUpForm(values: {
  emailAddress: string;
  password: string;
  confirmPassword: string;
}): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  const emailError = validateEmailAddress(values.emailAddress);
  if (emailError) {
    errors.emailAddress = emailError;
  }

  const passwordError = validatePassword(values.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function mapClerkError(error: unknown): {
  fieldErrors: AuthFieldErrors;
  formError?: string;
} {
  const fieldErrors: AuthFieldErrors = {};

  if (isClerkAPIResponseError(error)) {
    let formError: string | undefined;

    for (const issue of error.errors) {
      const message = issue.longMessage ?? issue.message;
      const paramName =
        issue.meta && typeof issue.meta.paramName === "string"
          ? normalizeParamName(issue.meta.paramName)
          : undefined;

      if (paramName && !fieldErrors[paramName]) {
        fieldErrors[paramName] = message;
        continue;
      }

      if (!formError) {
        formError = message;
      }
    }

    return {
      fieldErrors,
      formError: formError ?? error.errors[0]?.longMessage ?? error.message,
    };
  }

  if (error instanceof Error) {
    return {
      fieldErrors,
      formError: error.message || "Something went wrong. Please try again.",
    };
  }

  return {
    fieldErrors,
    formError: "Something went wrong. Please try again.",
  };
}

export async function navigateAfterAuth(
  router: Router,
  decorateUrl: (url: string) => string,
  destination: Href = AUTH_HOME_ROUTE,
) {
  const url = decorateUrl(String(destination));

  if (url.startsWith("http")) {
    if (Platform.OS === "web" && typeof globalThis.window !== "undefined") {
      globalThis.window.location.href = url;
      return;
    }

    await Linking.openURL(url);
    return;
  }

  router.replace(url as Href);
}

export function getUserDisplayName(user?: UserLike | null) {
  const fullName = user?.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  const firstName = user?.firstName?.trim();
  const lastName = user?.lastName?.trim();
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) {
    return firstName;
  }

  const username = user?.username?.trim();
  if (username) {
    return username;
  }

  const email = getUserEmail(user);
  if (email) {
    return email.split("@")[0] ?? "there";
  }

  return "there";
}

export function getUserEmail(user?: UserLike | null) {
  return user?.primaryEmailAddress?.emailAddress ?? null;
}

export function getVerificationHelper(emailAddress?: string | null) {
  if (!emailAddress) {
    return "Enter the 6-digit code we just sent to your inbox.";
  }

  return `Enter the 6-digit code we sent to ${emailAddress}.`;
}

function normalizeParamName(paramName: string): AuthFieldKey | undefined {
  const normalized = paramName.replace(/[\s-]/g, "_").toLowerCase();

  switch (normalized) {
    case "identifier":
    case "email_address":
    case "emailaddress":
      return "emailAddress";
    case "password":
      return "password";
    case "code":
      return "code";
    case "password_confirmation":
    case "confirmpassword":
      return "confirmPassword";
    default:
      return undefined;
  }
}
