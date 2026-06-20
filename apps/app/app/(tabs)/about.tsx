import React from 'react';
import { View, Text, ScrollView, Image, Linking, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '../../src/theme';
import { useLocale } from '../../src/context/LocaleContext';
import { SITE_CONFIG, DEFAULT_SOCIAL_LINKS } from '@shared/constants/index';
import type { SocialLink } from '@shared/types/index';

function localeToShort(locale: 'zh-CN' | 'en'): 'zh' | 'en' {
  return locale === 'zh-CN' ? 'zh' : 'en';
}

const SKILLS = [
  'AI Video Generation',
  'Storyboarding',
  'Visual Effects',
  'Motion Design',
  'Color Grading',
  'Sound Design',
];

const TOOLS = [
  'Runway Gen-3',
  'Pika',
  'Sora',
  'Midjourney',
  'Stable Diffusion',
  'ComfyUI',
  'DaVinci Resolve',
  'After Effects',
];

const SOCIAL_ICONS: Record<string, string> = {
  youtube: 'logo-youtube',
  bilibili: 'play-circle',
  twitter: 'logo-twitter',
  github: 'logo-github',
};

export default function AboutScreen() {
  const { locale, t } = useLocale();
  const shortLocale = localeToShort(locale);

  const handleSocialPress = async (link: SocialLink) => {
    const supported = await Linking.canOpenURL(link.url);
    if (supported) {
      await Linking.openURL(link.url);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('about.title')}</Text>
      </View>

      {/* Creator Card */}
      <View style={styles.creatorCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color={COLORS.accentLight} />
        </View>
        <Text style={styles.creatorName}>{SITE_CONFIG.name[shortLocale]}</Text>
        <Text style={styles.creatorBio}>
          {SITE_CONFIG.description[shortLocale]}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{SKILLS.length}</Text>
            <Text style={styles.statLabel}>{t('about.skills')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{TOOLS.length}</Text>
            <Text style={styles.statLabel}>{t('about.tools')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{DEFAULT_SOCIAL_LINKS.length}</Text>
            <Text style={styles.statLabel}>{t('about.social')}</Text>
          </View>
        </View>
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about.skills')}</Text>
        <View style={styles.tagGrid}>
          {SKILLS.map((skill) => (
            <View key={skill} style={styles.tag}>
              <Text style={styles.tagText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tools */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about.tools')}</Text>
        <View style={styles.tagGrid}>
          {TOOLS.map((tool) => (
            <View key={tool} style={[styles.tag, styles.toolTag]}>
              <Ionicons name="code-slash" size={14} color={COLORS.accent} />
              <Text style={styles.tagText}>{tool}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Social Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about.social')}</Text>
        {DEFAULT_SOCIAL_LINKS.map((link) => {
          const iconName = (link.icon && SOCIAL_ICONS[link.icon]) || 'link';
          return (
            <TouchableOpacity
              key={link.platform}
              style={styles.socialLink}
              onPress={() => handleSocialPress(link)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName as any}
                size={22}
                color={COLORS.accent}
              />
              <Text style={styles.socialPlatform}>{link.platform}</Text>
              <Ionicons
                name="open-outline"
                size={16}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {SITE_CONFIG.name[shortLocale]} &copy; {new Date().getFullYear()}
        </Text>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  creatorCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  creatorName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  creatorBio: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  toolTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  socialPlatform: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
  },
});