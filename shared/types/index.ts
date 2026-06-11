// ─── Work Categories ───────────────────────────────────────────────
// The five core categories for an AI video creator's portfolio,
// spanning both animation and live-action AI-generated content.

export type WorkCategory =
  | 'ai-animation-drama'
  | 'ai-live-drama'
  | 'ai-concept-trailer'
  | 'ai-creative-short'
  | 'ai-image-art';

// ─── Media Type ──────────────────────────────────────────────────

export type MediaType = 'video' | 'image';

// ─── Work Item ───────────────────────────────────────────────────
// Represents a single piece of portfolio content — a video or image
// created using AI tools such as Stable Diffusion, Runway, Pika, Sora, etc.

export interface WorkItem {
  /** Unique identifier, e.g. "work_abc123def" */
  id: string;
  /** Display title of the work */
  title: string;
  /** Short description / synopsis of the piece */
  description: string;
  /** Which portfolio category this belongs to */
  category: WorkCategory;
  /** 'video' for motion content, 'image' for still art */
  type: MediaType;
  /** URL or path to the thumbnail image (can be relative or absolute) */
  thumbnail: string;
  /** URL or path to the actual media file (video file or hi-res image) */
  mediaUrl: string;
  /** Duration in seconds — only meaningful for video content */
  duration?: number;
  /** Descriptive / discoverability tags (e.g. ["anime", "fantasy", "k-drama"]) */
  tags: string[];
  /** ISO-8601 date string when the work was first published or uploaded */
  createdAt: string;
  /** Whether the piece should appear in the "featured" showcase section */
  featured?: boolean;
  /** Bilibili video BV number — when set, the video is played via B站 embed instead of local file */
  bvid?: string;
}

// ─── Social Link ─────────────────────────────────────────────────

export interface SocialLink {
  /** Platform name, e.g. "YouTube", "Twitter/X", "Bilibili" */
  platform: string;
  /** Full URL to the profile */
  url: string;
  /** Optional icon identifier for rendering */
  icon?: string;
}

// ─── Portfolio Stats ─────────────────────────────────────────────
// Aggregate statistics shown on the portfolio landing page.

export interface PortfolioStats {
  totalWorks: number;
  totalVideos: number;
  totalImages: number;
  totalViews: number;
  totalLikes: number;
  totalDuration: number; // total seconds of video content
}

// ─── Portfolio Config ────────────────────────────────────────────
// Top-level configuration for the portfolio owner / creator.

export interface PortfolioConfig {
  /** Creator's display name */
  name: string;
  /** Short bio / tagline (supports both languages via Record or separate fields) */
  bio: string;
  /** URL or path to the avatar image */
  avatar: string;
  /** Social media profile links */
  socialLinks: SocialLink[];
  /** Aggregate portfolio statistics */
  stats: PortfolioStats;
}

// ─── Creator Metadata ────────────────────────────────────────────
// Additional metadata about the creator for SEO and rich previews.

export interface CreatorMetadata {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  email?: string;
  website?: string;
  location?: string;
  skills: string[];
  tools: string[]; // e.g. ["Midjourney", "Runway Gen-3", "Pika", "Sora"]
}

// ─── Filter Options ──────────────────────────────────────────────
// Controls for filtering the works grid / gallery.

export interface FilterOptions {
  /** Filter by a specific category; null/undefined means "all" */
  category?: WorkCategory | null;
  /** Filter by media type */
  type?: MediaType | null;
  /** Free-text search across title, description, and tags */
  query?: string;
  /** Show only featured works */
  featuredOnly?: boolean;
  /** Sort order */
  sort?: 'newest' | 'oldest' | 'title-asc' | 'title-desc';
  /** Pagination */
  page?: number;
  pageSize?: number;
}

// ─── Locale Type ─────────────────────────────────────────────────

export type Locale = 'zh-CN' | 'en';

// ─── Paginated Result ────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── API Response Envelope ───────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
