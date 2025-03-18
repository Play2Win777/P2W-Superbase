// types.ts
export interface Game {
  id: string;
  Game_Title: string;
  Platform: string;
  Genre: string;
  Sub_Genre: string | null;
  Age_Rating: string;
  Max_Offline_Players: string;
  Game_Modes: string[];
  Developer: string;
  Release_Year: number;
  Price_to_Sell_For: number;
  Metacritic_Score: number | null;
  User_Score: number | null;
  Short_Description: string;
  Key_Features: string;
  Unique_Selling_Point: string | null;
  image_url_medium: string;
  Youtube_link: string | null;
}

export interface CartItem {
  id: string;
  Game_Title: string;
  Price_to_Sell_For: number;
  quantity: number;
  isFlashSaleEligible?: boolean; // Add this line
  isBundleItem?: boolean; // Add this line to track bundle items
  image_url_medium: string; // Add this line to include images in the cart
}

export interface FilterState {
  platform: string;
  genre: string;
  subGenre: string;
  gameModes: string[];
  priceRange: { min: number; max: number };
}

export interface StoreState {
  games: Game[];
  filteredGames: Game[];
  currentPage: number;
  searchQuery: string;
  filters: FilterState;
  cart: CartItem[];
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  setGames: (games: Game[]) => void;
  setFilteredGames: (games: Game[]) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  addToCart: (game: Game) => void;
  removeFromCart: (gameId: string) => void;
  updateCartQuantity: (gameId: string, quantity: number) => void;
  fetchGames: () => void;
  getCartTotal: () => {
    subtotal: number;
    flashSaleDiscount: number;
    volumeDiscount: number;
    bundleDiscount: number; // Add this line
    flashSaleActive: boolean;
    flashSaleEligibleCount: number;
    total: number;
  };
}