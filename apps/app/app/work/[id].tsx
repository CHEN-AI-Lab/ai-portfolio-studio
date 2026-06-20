import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ResizeMode, Video } from 'expo-av';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '../../src/theme';
import { useLocale } from '../../src/context/LocaleContext';
import { useWorks } from '@shared/hooks/useWorks';
import { WorkCard } from '../../src/components/WorkCard';
import { Loading } from '../../src/components/Loading';
import { ErrorView } from '../../src/components/Error';
import { getCategoryLabel } from '../../src/i18n';
import { MEDIA_BASE_URL } from '../../src/constants';
import type { WorkItem } from '@shared/types/index';

const { width } = Dimensions.get('window');

export default function WorkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { locale, t } = useLocale();
  const { works, loading, error, refetch } = useWorks();
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoStatus, setVideoStatus] = useState<any>({});

  const work = works.find((w) => w.id === id);
  const related = works
    .filter((w) => w.id !== id && w.category === work?.category)
    .slice(0, 4);

  const handleWorkPress = (item: WorkItem) => {
    router.push(`/work/${item.id}`);
  };

  const togglePlayback = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    setVideoStatus(status);
    setIsPlaying(status.isPlaying ?? false);
  };

  function resolveUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${MEDIA_BASE_URL}/${path.replace(/^\//, '')}`;
  }

  // Show loading / error / not-found states
  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;
  if (!work) {
    return (
      <ErrorView
        message="Work not found"
        onRetry={() => router.back()}
      />
    );
  }

  const mediaUrl = resolveUrl(work.mediaUrl);
  const isVideo = work.type === 'video';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Media Player */}
      <View style={styles.mediaContainer}>
        {isVideo ? (
          <View>
            <Video
              ref={videoRef}
              source={{ uri: mediaUrl }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            />
            {!isPlaying && (
              <TouchableOpacity
                style={styles.playOverlay}
                onPress={togglePlayback}
                activeOpacity={0.7}
              >
                <View style={styles.playButton}>
                  <Ionicons name="play" size={32} color={COLORS.text} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
      </TouchableOpacity>

      {/* Work Info */}
      <View style={styles.infoSection}>
        <Text style={styles.title}>{work.title}</Text>

        {/* Meta Row */}
        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryLabel(work.category, locale)}
            </Text>
          </View>
          {work.duration && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.metaText}>
                {Math.floor(work.duration / 60)}:
                {(work.duration % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons
              name={isVideo ? 'videocam' : 'image'}
              size={16}
              color={COLORS.textMuted}
            />
            <Text style={styles.metaText}>
              {isVideo ? 'Video' : 'Image'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{work.description}</Text>

        {/* Tags */}
        {work.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionLabel}>{t('workDetail.tags')}</Text>
            <View style={styles.tagsRow}>
              {work.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Date */}
        <Text style={styles.date}>
          {new Date(work.createdAt).toLocaleDateString(
            locale === 'zh-CN' ? 'zh-CN' : 'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' },
          )}
        </Text>
      </View>

      {/* Related Works */}
      {related.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>{t('workDetail.relatedWorks')}</Text>
          {related.map((item) => (
            <WorkCard key={item.id} work={item} onPress={handleWorkPress} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xxl,
  },
  mediaContainer: {
    width,
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardOverlay,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: COLORS.accentDim,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    color: COLORS.accentLight,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  tagsSection: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.full,
  },
  tagText: {
    color: COLORS.accentLight,
    fontSize: FONT_SIZES.xs,
  },
  date: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
  },
  relatedSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  relatedTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
});