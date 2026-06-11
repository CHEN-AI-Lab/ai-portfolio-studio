import type { Metadata } from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {NavBar} from '@/components/NavBar';
import {Footer} from '@/components/Footer';
import {ScrollToTop} from '@/components/ScrollToTop';
import ScrollReveal from '@/components/ScrollReveal';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  metadataBase: new URL('https://aicreative.studio'),
  title: {
    default: 'AI Creative Studio — AI 创艺工坊',
    template: '%s | AI Creative Studio',
  },
  description: '探索人工智能与视觉艺术的无限可能 — AI 漫剧、真人短剧、概念预告片与创意视觉作品集',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'AI Creative Studio',
    title: 'AI Creative Studio — AI 创艺工坊',
    description: '探索人工智能与视觉艺术的无限可能 — AI 漫剧、真人短剧、概念预告片与创意视觉作品集',
    images: [{ url: '/og-default.svg', width: 1200, height: 630 }],
  },
};

const VALID_LOCALES = ['zh-CN', 'en'] as const;

type ValidLocale = (typeof VALID_LOCALES)[number];

function isValidLocale(value: string): value is ValidLocale {
  return VALID_LOCALES.includes(value as ValidLocale);
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale — 404 if unknown
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NavBar />
          <main id="main-content" className="page-transition">{children}</main>
          <Footer />
          <ScrollToTop />
          <ScrollReveal />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
