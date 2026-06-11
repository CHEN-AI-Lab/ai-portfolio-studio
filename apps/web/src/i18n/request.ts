import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale: string = localeCookie?.value ?? 'zh-CN';

  const normalizedLocale = locale.startsWith('en') ? 'en' : 'zh-CN';

  return {
    locale: normalizedLocale,
    messages: (await import(`../../../../shared/messages/${normalizedLocale}.json`)).default,
  };
});