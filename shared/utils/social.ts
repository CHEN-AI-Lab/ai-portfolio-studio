// ─── Social Sharing Utilities ──────────────────────────────────────
// Lightweight helper functions for sharing content on social platforms.

interface ShareData {
  url: string;
  title: string;
  description: string;
}

/**
 * Generate a Twitter/X intent share URL.
 */
export function shareToTwitter({ url, title }: ShareData): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
}

/**
 * Generate a Weibo share URL.
 */
export function shareToWeibo({ url, title }: ShareData): string {
  return `https://service.weibo.com/share/share.php?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
}

/**
 * Copy arbitrary text to the system clipboard.
 * Falls back to a resolved false promise when the Clipboard API is unavailable.
 */
export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}