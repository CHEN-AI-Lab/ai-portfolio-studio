import { z } from 'zod';

// ─── Zod Helpers ─────────────────────────────────────────────────

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, {
    message: 'createdAt must be an ISO-8601 date string (e.g. 2025-06-04T12:00:00Z)',
  });

// ─── Work Category Schema ────────────────────────────────────────

export const workCategorySchema = z.enum([
  'ai-animation-drama',
  'ai-live-drama',
  'ai-concept-trailer',
  'ai-creative-short',
  'ai-image-art',
]);

// ─── Media Type Schema ───────────────────────────────────────────

export const mediaTypeSchema = z.enum(['video', 'image']);

// ─── Social Link Schema ──────────────────────────────────────────

export const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform name is required'),
  url: z.string().url('Must be a valid URL'),
  icon: z.string().optional(),
});

// ─── Work Item Schema ────────────────────────────────────────────
// Used to validate work uploads / submissions from the admin panel.

export const workItemSchema = z.object({
  id: z
    .string()
    .min(1, 'ID is required')
    .regex(/^work_[a-z0-9]+$/, 'ID must match format "work_<alphanumeric>"'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be 2000 characters or fewer'),
  category: workCategorySchema,
  type: mediaTypeSchema,
  thumbnail: z
    .string()
    .min(1, 'Thumbnail URL or path is required')
    .max(500, 'Thumbnail path too long'),
  mediaUrl: z
    .string()
    .min(1, 'Media URL or path is required')
    .max(500, 'Media URL path too long'),
  duration: z
    .number()
    .int('Duration must be an integer (seconds)')
    .positive('Duration must be a positive number')
    .optional(),
  tags: z
    .array(z.string().max(50, 'Each tag must be 50 characters or fewer'))
    .max(20, 'Maximum 20 tags allowed')
    .default([]),
  createdAt: isoDateString,
  featured: z.boolean().optional().default(false),
});

export type WorkItemInput = z.infer<typeof workItemSchema>;

// ─── Work Item Update Schema ─────────────────────────────────────
// Same as above but all fields optional for PATCH operations.

export const workItemUpdateSchema = workItemSchema.partial().omit({ id: true });

export type WorkItemUpdate = z.infer<typeof workItemUpdateSchema>;

// ─── Portfolio Stats Schema ──────────────────────────────────────

export const portfolioStatsSchema = z.object({
  totalWorks: z.number().int().nonnegative().default(0),
  totalVideos: z.number().int().nonnegative().default(0),
  totalImages: z.number().int().nonnegative().default(0),
  totalViews: z.number().int().nonnegative().default(0),
  totalLikes: z.number().int().nonnegative().default(0),
  totalDuration: z.number().int().nonnegative().default(0),
});

// ─── Filter Schema ───────────────────────────────────────────────

export const filterSchema = z.object({
  category: workCategorySchema.nullable().optional(),
  type: mediaTypeSchema.nullable().optional(),
  query: z.string().max(200).optional(),
  featuredOnly: z.boolean().optional(),
  sort: z.enum(['newest', 'oldest', 'title-asc', 'title-desc']).optional().default('newest'),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().min(1).max(48).optional().default(12),
});

export type FilterInput = z.infer<typeof filterSchema>;

// ─── Portfolio Config Schema ─────────────────────────────────────

export const portfolioConfigSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  bio: z.string().min(1).max(500),
  avatar: z.string().min(1).max(500),
  socialLinks: z.array(socialLinkSchema).default([]),
  stats: portfolioStatsSchema.default({}),
});

export type PortfolioConfigInput = z.infer<typeof portfolioConfigSchema>;