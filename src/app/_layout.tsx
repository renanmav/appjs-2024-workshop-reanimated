import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: true,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "" }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
