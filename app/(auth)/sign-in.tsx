import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SignIn = () => {
  return (
    <View className="p-6">
      <Text className="mt-20">Sign In</Text>

      <Link href="/(auth)/sign-up">Create Account</Link>
    </View>
  );
};

export default SignIn;
