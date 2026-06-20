import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { WorkItem } from '@shared/types/index';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '../theme';
import { useLocale } from '../context/LocaleContext';
import { getCategoryLabel } from '../i18n';
import { MEDIA_BASE_URL } from '../constants';

interface WorkCardProps {
  work: WorkItem;
  onPress: (work: WorkItem) => void;
}

export function WorkCard({ work, onPress }: WorkCardProps) {
  const { locale } = useLocale();

  const thumbnailUrl = work.thumbnail.startsWith('http')
    ? work.thumbnail
    : `${MEDIA_BASE_URL}/${work.thumbnail.replace(/^\//, '')}`;

  const categoryLabel = getCategoryLabel(work.category, locale);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(work)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{categoryLabel}</Text>
      </View>
      {work.type === 'video' && (
        <View style={styles.playIcon}>
          <Ionicons name="play-circle" size={28} color={COLORS.text} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {work.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {work.description}
        </Text>
        <View style={styles.meta}>
          {work.duration && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>
                {Math.floor(work.duration / 60)}:{(work.duration % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons
              name={work.type === 'video' ? 'videocam' : 'image'}
              size={12}
              color={COLORS.textMuted}
            />
            <Text style={styles.metaText}>{work.type}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.surfaceLight,
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -14 }, { translateY: -14 }],
    opacity: 0.9,
  },
  info: {
    padding: SPACING.sm + 2,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  meta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
  },
});