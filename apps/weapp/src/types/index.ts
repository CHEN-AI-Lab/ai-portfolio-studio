// Re-export shared types for use in Taro app
// This avoids needing to import deeply into the monorepo from each file
export type {
  WorkItem,
  WorkCategory,
  MediaType,
  PortfolioStats,
  PortfolioConfig,
  CreatorMetadata,
  FilterOptions,
  Locale,
  PaginatedResult,
  ApiResponse,
  SocialLink,
  CategoryDef,
} from 'shared/types'

// Re-export constants
export {
  CATEGORIES,
  WORK_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  DEFAULT_PORTFOLIO_STATS,
  SITE_CONFIG,
  DEFAULT_SOCIAL_LINKS,
  PAGINATION,
} from 'shared/constants'