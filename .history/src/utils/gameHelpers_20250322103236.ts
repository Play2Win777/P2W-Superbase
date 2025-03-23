// utils/gameHelpers.ts
export const isFlashSaleEligible = (game: any): boolean => {
  if (!game) return false;
  
  // Games with Metacritic score > 85 are eligible for flash sale
  // You can customize this logic based on your requirements
  return game.Metacritic_Score && parseInt(game.Metacritic_Score) < 70;
};


// utils/gameHelpers.ts
export const isIntroSaleEligible = (game: any): boolean => {
  if (!game) return false;
  // Only Xbox One games are eligible for the Intro Sale
  return game.Platform === 'Xbox One';
};