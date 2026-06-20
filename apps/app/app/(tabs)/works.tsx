import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '../../src/theme';
import { useLocale } from '../../src/context/LocaleContext';
import { useWorks } from '@shared/hooks/useWorks';
import { WorkCard } from '../../src/components/WorkCard';
import { Loading } from '../../src/components/Loading';
import { ErrorView } from '../../src/components/Error';
import { CATEGORIES } from '@shared/constants/index';
import type { WorkItem, WorkCategory } from '@shared/types/index';

type SortMode = 'newest' | 'oldest';

export default function WorksScreen() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { works, loading, error, refetch } = useWorks();

  const [selectedCategory, setSelectedCategory] = useState<WorkCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const filtered = useMemo(() => {
    let result = [...works];

    // Category filter
    if (selectedCategory) {
      result = result.filter((w) => w.category === selectedCategory);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    // Sort
    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortMode === 'newest' ? db - da : da - db;
    });

    return result;
  }, [works, selectedCategory, searchQuery, sortMode]);

  const handleWorkPress = (work: WorkItem) => {
    router.push(`/work/${work.id}`);
  };

  const renderWork = ({ item }: { item: WorkItem }) => (
    <View style={styles.gridItem}>
      <WorkCard work={item} onPress={handleWorkPress} />
    </View>
  );

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('works.title')}</Text>
        <Text style={styles.count}>{filtered.length} items</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: null, label: { zh: '全部', en: 'All' } } as any, ...CATEGORIES]}
        keyExtractor={(item) => item.id ?? 'all'}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const isActive = item.id === selectedCategory;
          return (
            <TouchableOpacity
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedCategory(item.id)}
              activeOpacity={0.7}
            >
              {item.icon && <Text style={styles.filterIcon}>{item.icon}</Text>}
              <Text
                style={[
                  styles.filterLabel,
                  isActive && styles.filterLabelActive,
                ]}
              >
                {item.id ? item.label[locale] : t('works.filterAll')}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Sort Toggle */}
      <View style={styles.sortRow}>
        <TouchableOpacity
          style={[styles.sortBtn, sortMode === 'newest' && styles.sortBtnActive]}
          onPress={() => setSortMode('newest')}
        >
          <Text
            style={[styles.sortLabel, sortMode === 'newest' && styles.sortLabelActive]}
          >
            {t('works.sortNewest')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortMode === 'oldest' && styles.sortBtnActive]}
          onPress={() => setSortMode('oldest')}
        >
          <Text
            style={[styles.sortLabel, sortMode === 'oldest' && styles.sortLabelActive]}
          >
            {t('works.sortOldest')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Works Grid */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>{t('works.noWorks')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderWork}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  count: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 40,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
  },
  filterRow: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: COLORS.accent,
  },
  filterIcon: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  filterLabelActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  sortBtn: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  sortBtnActive: {
    backgroundColor: COLORS.accentDim,
  },
  sortLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  sortLabelActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  gridRow: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  gridItem: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.md,
  },
});