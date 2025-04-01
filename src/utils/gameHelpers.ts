// utils/gameHelpers.ts

/**
 * Determines if a game is eligible for the Flash Sale.
 * @param game - The game object.
 * @returns True if the game is eligible for the Flash Sale, false otherwise.
 */
export const isFlashSaleEligible = (game: any): boolean => {
  if (!game) return false;

  // Games with Metacritic score > 85 are eligible for flash sale
  // You can customize this logic based on your requirements
  return game.Metacritic_Score && parseInt(game.Metacritic_Score) < 70;
};

/**
 * Determines if a game is eligible for the Intro Sale.
 * @param game - The game object.
 * @returns True if the game is eligible for the Intro Sale, false otherwise.
 */
export const isIntroSaleEligible = (game: any): boolean => {
  if (!game) return false;

  // Debugging: Log the game's platform
  console.log(`Game: ${game.Game_Title}, Platform: "${game.Platform}"`);

  // Only Xbox One games are eligible for the Intro Sale
  return game.Platform === 'Xbox One';
};

/**
 * Determines the Intro Sale discount rate based on the number of Intro Sale items.
 * @param introSaleCount - The number of Intro Sale items in the cart.
 * @returns The discount rate as a decimal (e.g., 0.55 for 55%).
 */
export const getIntroSaleDiscountRate = (introSaleCount: number): number => {
  if (introSaleCount >= 11) return 0.55;
  if (introSaleCount >= 10) return 0.5;
  if (introSaleCount >= 9) return 0.45;
  if (introSaleCount >= 8) return 0.4;
  if (introSaleCount >= 7) return 0.35;
  if (introSaleCount >= 6) return 0.3;
  if (introSaleCount >= 5) return 0.25;
  if (introSaleCount >= 4) return 0.2;
  if (introSaleCount >= 3) return 0.15;
  if (introSaleCount >= 2) return 0.1;
  if (introSaleCount >= 1) return 0.05;
  return 0;
};

/**
 * Determines if the Flash Sale is active based on the number of Flash Sale items.
 * @param flashSaleEligibleCount - The number of Flash Sale items in the cart.
 * @returns True if the Flash Sale is active, false otherwise.
 */
export const isFlashSaleActive = (flashSaleEligibleCount: number): boolean => {
  return flashSaleEligibleCount >= 3;
};

/**
 * Determines the Volume Discount rate based on the total number of Volume Discount items.
 * @param totalVolumeItems - The total number of Volume Discount items in the cart.
 * @returns The discount rate as a decimal (e.g., 0.2 for 20%).
 */
export const getVolumeDiscountRate = (totalVolumeItems: number): number => {
  if (totalVolumeItems >= 5) return 0.2;
  if (totalVolumeItems >= 3) return 0.1;
  if (totalVolumeItems >= 2) return 0.05;
  return 0;
};