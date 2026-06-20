import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LocaleProvider } from '../src/context/LocaleContext';
import { COLORS } from '../src/theme';

export default function RootLayout() {
  return (
    <LocaleProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="work/[id]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
            headerBackTitle: 'Back',
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </LocaleProvider>
  );
}