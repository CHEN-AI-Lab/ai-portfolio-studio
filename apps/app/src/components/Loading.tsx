import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../theme';
import { useLocale } from '../context/LocaleContext';

export function Loading({ message }: { message?: string }) {
  const { t } = useLocale();
  const text = message ?? t('common.loading');
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.accent} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.md,
  },
});