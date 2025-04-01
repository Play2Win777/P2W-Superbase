// utils/imageUtils.ts
const SUPABASE_STORAGE_URL = "https://eeikeheizmdybnufjqji.supabase.co/storage/v1/object/public/covers/";

/**
 * Determines the image suffix based on screen width.
 * - Mobile (< 768px): "_small.webp"
 * - Laptop (768px - 1200px): ".webp"
 * - TV (> 1200px): "_large.webp"
 */
const getImageSuffix = (): string => {
  const width = window.innerWidth;
  if (width < 1080) return "_small.webp"; // Mobile
  if (width <= 1920) return ".webp";     // Laptop
  return "_large.webp";                  // TV
};

/**
 * Generates the Supabase image URL for a game based on its ID and screen size.
 * @param gameId - The unique game ID from Supabase.
 * @returns The full image URL.
 */
export const getGameCoverUrl = (gameId: string): string => {
  const suffix = getImageSuffix();
  return `${SUPABASE_STORAGE_URL}${gameId}${suffix}`;
};

/**
 * Generates the fallback image URL (JPG) for a game.
 * @param gameId - The unique game ID from Supabase.
 * @returns The full fallback image URL.
 */
export const getGameCoverFallbackUrl = (gameId: string): string => {
  return `${SUPABASE_STORAGE_URL}${gameId}_fback.jpg`;
};
