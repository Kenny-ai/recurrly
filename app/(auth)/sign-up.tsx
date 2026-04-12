import AuthButton from "@/components/auth/AuthButton";
import AuthField from "@/components/auth/AuthField";
import AuthScreen from "@/components/auth/AuthScreen";
import {
  AUTH_HOME_ROUTE,
  AUTH_SIGN_IN_ROUTE,
  getVerificationHelper,
  mapClerkError,
  navigateAfterAuth,
  validateSignUpForm,
  validateVerificationCode,
  type AuthFieldErrors,
} from "@/lib/auth";
import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";

const SignUp = () => {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const isBusy = fetchStatus === "fetching";
  const normalizedEmail = useMemo(
    () => emailAddress.trim().toLowerCase(),
    [emailAddress],
  );

  const isVerifying =
    signUp?.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const updateField = (key: keyof AuthFieldErrors, value: string) => {
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(undefined);
    setNotice(undefined);

    if (key === "emailAddress") {
      setEmailAddress(value);
      return;
    }

    if (key === "password") {
      setPassword(value);
      return;
    }

    if (key === "confirmPassword") {
      setConfirmPassword(value);
      return;
    }

    if (key === "code") {
      setCode(value.replace(/\D/g, "").slice(0, 6));
    }
  };

  const finalizeSignUp = async () => {
    if (!signUp) {
      return;
    }

    const { error } = await signUp.finalize({
      navigate: ({ decorateUrl }) =>
        navigateAfterAuth(router, decorateUrl, AUTH_HOME_ROUTE),
    });

    if (error) {
      const mapped = mapClerkError(error);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
    }
  };

  const handleSubmit = async () => {
    if (!signUp) {
      return;
    }

    const nextErrors = validateSignUpForm({
      emailAddress: normalizedEmail,
      password,
      confirmPassword,
    });

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setFormError(undefined);
    setNotice(undefined);

    const { error } = await signUp.password({
      emailAddress: normalizedEmail,
      password,
    });

    if (error) {
      const mapped = mapClerkError(error);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
      return;
    }

    const verificationResponse = await signUp.verifications.sendEmailCode();
    if (verificationResponse.error) {
      const mapped = mapClerkError(verificationResponse.error);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
      return;
    }

    setNotice(`Your verification code is on its way to ${normalizedEmail}.`);
  };

  const handleVerify = async () => {
    if (!signUp) {
      return;
    }

    const codeError = validateVerificationCode(code);
    if (codeError) {
      setFieldErrors({ code: codeError });
      return;
    }

    setFieldErrors({});
    setFormError(undefined);

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });

    if (error) {
      const mapped = mapClerkError(error);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
      return;
    }

    if (signUp.status === "complete") {
      await finalizeSignUp();
      return;
    }

    setFormError(
      "We couldn't finish verification yet. Request a new code and try again.",
    );
  };

  const handleResendCode = async () => {
    if (!signUp) {
      return;
    }

    setFieldErrors((current) => ({ ...current, code: undefined }));
    setFormError(undefined);

    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      const mapped = mapClerkError(error);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
      return;
    }

    setNotice(`A fresh verification code is on its way to ${normalizedEmail}.`);
  };

  const handleReset = async () => {
    if (!signUp) {
      return;
    }

    await signUp.reset();
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setFieldErrors({});
    setFormError(undefined);
    setNotice(undefined);
  };

  if (isVerifying) {
    return (
      <AuthScreen
        title="Verify your email"
        subtitle="One last step and your renewal dashboard is ready to go."
        eyebrow="Almost there"
        footer={
          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have access?</Text>
            <Link href={AUTH_SIGN_IN_ROUTE}>
              <Text className="auth-link">Sign in instead</Text>
            </Link>
          </View>
        }
      >
        <View className="auth-form">
          <AuthField
            autoComplete="one-time-code"
            keyboardType="number-pad"
            label="Verification code"
            maxLength={6}
            onChangeText={(value) => updateField("code", value)}
            placeholder="Enter the 6-digit code"
            value={code}
            error={fieldErrors.code}
            helper={code.length ? `${code.length}/6` : undefined}
          />

          <Text className="auth-helper">
            {getVerificationHelper(normalizedEmail)}
          </Text>

          {notice ? (
            <View className="rounded-2xl bg-success/10 p-3">
              <Text className="text-sm font-sans-semibold text-success">
                {notice}
              </Text>
            </View>
          ) : null}

          {formError ? (
            <View className="rounded-2xl bg-destructive/10 p-3">
              <Text className="text-sm font-sans-semibold text-destructive">
                {formError}
              </Text>
            </View>
          ) : null}

          <AuthButton
            label="Create my workspace"
            loading={isBusy}
            disabled={code.trim().length !== 6}
            onPress={handleVerify}
          />

          <AuthButton
            label="Send a new code"
            variant="secondary"
            loading={isBusy}
            onPress={handleResendCode}
          />

          <AuthButton
            label="Start over"
            variant="secondary"
            onPress={handleReset}
          />
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Set up a secure space for every renewal, payment notice, and subscription decision."
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">Already tracking with us?</Text>
          <Link href={AUTH_SIGN_IN_ROUTE}>
            <Text className="auth-link">Sign in</Text>
          </Link>
        </View>
      }
    >
      <View className="auth-form">
        <AuthField
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) => updateField("emailAddress", value)}
          placeholder="you@company.com"
          textContentType="emailAddress"
          value={emailAddress}
          error={fieldErrors.emailAddress}
        />

        <AuthField
          autoComplete="new-password"
          label="Password"
          helper="8+ chars"
          onChangeText={(value) => updateField("password", value)}
          placeholder="Create a password"
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          trailingLabel={showPassword ? "Hide" : "Show"}
          onTrailingPress={() => setShowPassword((current) => !current)}
          value={password}
          error={fieldErrors.password}
        />

        <AuthField
          autoComplete="new-password"
          label="Confirm password"
          onChangeText={(value) => updateField("confirmPassword", value)}
          placeholder="Repeat your password"
          secureTextEntry={!showConfirmPassword}
          textContentType="newPassword"
          trailingLabel={showConfirmPassword ? "Hide" : "Show"}
          onTrailingPress={() => setShowConfirmPassword((current) => !current)}
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
        />

        {formError ? (
          <View className="rounded-2xl bg-destructive/10 p-3">
            <Text className="text-sm font-sans-semibold text-destructive">
              {formError}
            </Text>
          </View>
        ) : null}

        <AuthButton
          label="Continue"
          loading={isBusy}
          disabled={!normalizedEmail || !password || !confirmPassword}
          onPress={handleSubmit}
        />

        <Text className="text-center text-sm font-sans-medium leading-6 text-muted-foreground">
          We’ll send a quick verification code before opening your workspace.
        </Text>
      </View>
    </AuthScreen>
  );
};

export default SignUp;
