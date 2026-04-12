import AuthButton from "@/components/auth/AuthButton";
import AuthField from "@/components/auth/AuthField";
import AuthScreen from "@/components/auth/AuthScreen";
import {
  AUTH_HOME_ROUTE,
  AUTH_SIGN_UP_ROUTE,
  getVerificationHelper,
  mapClerkError,
  navigateAfterAuth,
  validateSignInForm,
  validateVerificationCode,
  type AuthFieldErrors,
} from "@/lib/auth";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";

const SignIn = () => {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const isBusy = fetchStatus === "fetching";
  const normalizedEmail = useMemo(
    () => emailAddress.trim().toLowerCase(),
    [emailAddress],
  );
  const isVerifying = signIn?.status === "needs_client_trust";

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

    if (key === "code") {
      setCode(value.replace(/\D/g, "").slice(0, 6));
    }
  };

  const finalizeSignIn = async () => {
    if (!signIn) {
      return;
    }

    const { error } = await signIn.finalize({
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
    if (!signIn) {
      return;
    }

    const nextErrors = validateSignInForm({
      emailAddress: normalizedEmail,
      password,
    });

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setFormError(undefined);
    setNotice(undefined);

    const { error } = await signIn.password({
      emailAddress: normalizedEmail,
      password,
    });

    if (error) {
      const mapped = mapClerkError(error);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSignIn();
      return;
    }

    if (signIn.status === "needs_client_trust") {
      const supportsEmailCode = signIn.supportedSecondFactors.some(
        (factor) => factor.strategy === "email_code",
      );

      if (!supportsEmailCode) {
        setFormError(
          "Your account needs another verification method before you can sign in here.",
        );
        return;
      }

      const response = await signIn.mfa.sendEmailCode();
      if (response.error) {
        const mapped = mapClerkError(response.error);
        setFieldErrors(mapped.fieldErrors);
        setFormError(mapped.formError);
        return;
      }

      setNotice(`A verification code is on its way to ${normalizedEmail}.`);
      return;
    }

    setFormError("We couldn't complete sign in yet. Please try again.");
  };

  const handleVerify = async () => {
    if (!signIn) {
      return;
    }

    const codeError = validateVerificationCode(code);
    if (codeError) {
      setFieldErrors({ code: codeError });
      return;
    }

    setFieldErrors({});
    setFormError(undefined);

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
    if (error) {
      const mapped = mapClerkError(error);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSignIn();
      return;
    }

    setFormError(
      "That code didn't complete sign in. Request a fresh one and try again.",
    );
  };

  const handleResendCode = async () => {
    if (!signIn) {
      return;
    }

    setFieldErrors((current) => ({ ...current, code: undefined }));
    setFormError(undefined);

    const { error } = await signIn.mfa.sendEmailCode();
    if (error) {
      const mapped = mapClerkError(error);
      setFieldErrors(mapped.fieldErrors);
      setFormError(mapped.formError);
      return;
    }

    setNotice(`A fresh code is on its way to ${normalizedEmail}.`);
  };

  const handleReset = async () => {
    if (!signIn) {
      return;
    }

    await signIn.reset();
    setCode("");
    setPassword("");
    setFieldErrors({});
    setFormError(undefined);
    setNotice(undefined);
  };

  if (isVerifying) {
    return (
      <AuthScreen
        title="Check your inbox"
        subtitle="We added a quick email step to confirm it’s really you before opening your workspace."
        eyebrow="One more secure step"
        footer={
          <View className="auth-link-row">
            <Text className="auth-link-copy">Wrong email?</Text>
            <Link href={AUTH_SIGN_UP_ROUTE}>
              <Text className="auth-link">Create a new account</Text>
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
            label="Verify and continue"
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
      title="Welcome back"
      subtitle="Sign in to keep your renewals, account notices, and spend overview in one clear place."
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">New here?</Text>
          <Link href={AUTH_SIGN_UP_ROUTE}>
            <Text className="auth-link">Create your account</Text>
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
          autoComplete="password"
          label="Password"
          onChangeText={(value) => updateField("password", value)}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          textContentType="password"
          trailingLabel={showPassword ? "Hide" : "Show"}
          onTrailingPress={() => setShowPassword((current) => !current)}
          value={password}
          error={fieldErrors.password}
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
          disabled={!normalizedEmail || !password}
          onPress={handleSubmit}
        />

        <Text className="text-center text-sm font-sans-medium leading-6 text-muted-foreground">
          Your session stays secure on this device and opens straight into your
          overview.
        </Text>
      </View>
    </AuthScreen>
  );
};

export default SignIn;
