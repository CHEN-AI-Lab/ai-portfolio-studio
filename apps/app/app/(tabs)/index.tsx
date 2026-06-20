import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '../../src/theme';
import { useLocale } from '../../src/context/LocaleContext';
import { useWorks } from '@shared/hooks/useWorks';
import { WorkCard } from '../../src/components/WorkCard';
import { Loading } from '../../src/components/Loading';
import { ErrorView } from '../../src/components/Error';
import { CATEGORIES, SITE_CONFIG, DEFAULT_PORTFOLIO_STATS } from '@shared/constants/index';
import type { WorkItem, WorkCategory } from '@shared/types/index';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

function localeToShort(locale: 'zh-CN' | 'en'): 'zh' | 'en' {
  return locale === 'zh-CN' ? 'zh' : 'en';
}

export default function HomeScreen() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const shortLocale = localeToShort(locale);
  const { works, loading, error, refetch } = useWorks();

  const featured = works.filter((w) => w.featured).slice(0, 4);
  const config = SITE_CONFIG;

  const handleWorkPress = (work: WorkItem) => {
    router.push(`/work/${work.id}`);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroAccent} />
        <Text style={styles.heroTitle}>{config.name[shortLocale]}</Text>
        <Text style={styles.heroSubtitle}>{config.description[shortLocale]}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{works.length}</Text>
            <Text style={styles.statLabel}>{t('home.heroStats.totalWorks')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {works.filter((w) => w.type === 'video').length}
            </Text>
            <Text style={styles.statLabel}>{t('home.heroStats.totalVideos')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {works.filter((w) => w.type === 'image').length}
            </Text>
            <Text style={styles.statLabel}>{t('home.heroStats.totalImages')}</Text>
          </View>
        </View>
      </View>

      {/* Featured Section */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.featuredSection')}</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/works')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAll}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {featured.map((work) => (
              <View key={work.id} style={{ width: CARD_WIDTH, marginRight: SPACING.sm }}>
                <WorkCard work={work} onPress={handleWorkPress} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.categorySection')}</Text>
      </View>
      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((cat) => {
          const categoryWorks = works.filter((w) => w.category === cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => router.push('/(tabs)/works')}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryLabel}>{cat.label[shortLocale]}</Text>
              <Text style={styles.categoryCount}>
                {categoryWorks.length} works
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  hero: {
    paddingTop: 80,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
  },
  heroAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: COLORS.accent,
    opacity: 0.08,
  },
  heroTitle: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: '600',
  },
  featuredScroll: {
    paddingRight: SPACING.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
  },
  categoryCard: {
    width: '46%',
    marginHorizontal: '2%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});