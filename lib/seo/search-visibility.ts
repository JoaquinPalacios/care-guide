/**
 * Future clinic/template search-visibility contract.
 *
 * Do not add a Prisma field until a clinic can actually opt a published
 * guide into indexing from a reviewed UI. Launch default remains
 * PRIVATE_FROM_SEARCH via metadata noindex.
 */
export const FUTURE_GUIDE_SEARCH_VISIBILITY = {
  PRIVATE_FROM_SEARCH: "PRIVATE_FROM_SEARCH",
  INDEXABLE: "INDEXABLE",
} as const;

export const DEFAULT_GUIDE_SEARCH_VISIBILITY =
  FUTURE_GUIDE_SEARCH_VISIBILITY.PRIVATE_FROM_SEARCH;

export const GUIDE_INDEXING_REQUIREMENTS = [
  "The guide is published on the tenant host.",
  "Search visibility is deliberately enabled.",
  "The document has sufficient differentiated content.",
  "Clinical/content governance for that document is in place.",
] as const;
