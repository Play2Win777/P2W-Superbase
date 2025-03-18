import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, FilterState, Game } from './types';
import { fetchGames } from './api';
import { isFlashSaleEligible } from './utils/gameHelpers';

// Update the StoreState interface to include loyalty features and cart total calculation
interface StoreState {
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
  // Add this method for calculating cart totals with discounts
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

export const useStore = create<StoreState>()((set, get) => ({
  games: [],
  filteredGames: [],
  currentPage: 1,
  searchQuery: '',
  filters: {
    platform: '',
    genre: '',
    subGenre: '',
    gameModes: [],
    priceRange: { min: 10, max: 60 },
  },
  cart: [],
  // Initialize loyalty program values
  loyaltyPoints: 0,
  loyaltyTier: 'Bronze',
  
  setGames: (games) => set({ games }),
  setFilteredGames: (filteredGames) => set({ filteredGames }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
    
  // Enhanced addToCart that also awards loyalty points and tracks flash sale eligibility
  addToCart: (game) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === game.id);
      
      // Calculate loyalty points to add based on game price
      const pointsToAdd = Math.floor((game.Price_to_Sell_For || 0) * 10);
      const newPoints = state.loyaltyPoints + pointsToAdd;
      
      // Determine loyalty tier based on total points
      let newTier = state.loyaltyTier;
      if (newPoints >= 5000) newTier = 'Platinum';
      else if (newPoints >= 2000) newTier = 'Gold';
      else if (newPoints >= 500) newTier = 'Silver';
      else newTier = 'Bronze';
      
      // Check if game is eligible for flash sale
      const isEligible = isFlashSaleEligible(game);
      
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === game.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          loyaltyPoints: newPoints,
          loyaltyTier: newTier,
        };
      }
      
      return {
        cart: [
          ...state.cart,
          {
            id: game.id,
            Game_Title: game.Game_Title,
            Price_to_Sell_For: game.Price_to_Sell_For,
            quantity: 1,
            isFlashSaleEligible: isEligible, // Store eligibility status
            image_url_medium: game.image_url_medium // Make sure images are included
          },
        ],
        loyaltyPoints: newPoints,
        loyaltyTier: newTier,
      };
    }),
    
  removeFromCart: (gameId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== gameId),
    })),
    
  updateCartQuantity: (gameId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === gameId ? { ...item, quantity } : item
      ),
    })),
    
  fetchGames: async () => {
    const { games } = get();
    if (games.length === 0) {
      const fetchedGames = await fetchGames();
      set({ games: fetchedGames });
    }
  },
  
  // Calculate cart totals with discounts
  getCartTotal: () => {
    const { cart } = get();
  
    // Categorize items
    const flashSaleItems = cart.filter(item => item.isFlashSaleEligible);
    const regularItems = cart.filter(item => !item.isFlashSaleEligible);
    const bundleItems = cart.filter(item => item.isBundleItem);
  
    // Calculate subtotals
    const flashSaleSubtotal = flashSaleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
    const regularSubtotal = regularItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
    const bundleSubtotal = bundleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
    
    // Apply flash sale discount
    const flashSaleEligibleCount = flashSaleItems.reduce((count, item) => count + item.quantity, 0);
    const flashSaleActive = flashSaleEligibleCount >= 3;
    let flashSaleDiscount = flashSaleActive ? flashSaleSubtotal * 0.25 : 0;
  
    // Apply bundle discount (15%)
    const bundleDiscount = bundleSubtotal * 0.15;
  
    // Apply volume discount
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    let volumeDiscountRate = totalItems >= 5 ? 0.2 : totalItems >= 3 ? 0.1 : totalItems >= 2 ? 0.05 : 0;
    const volumeDiscount = regularSubtotal * volumeDiscountRate;
  
    const subtotal = flashSaleSubtotal + regularSubtotal + bundleSubtotal;
    const total = subtotal - flashSaleDiscount - volumeDiscount - bundleDiscount;
  
    return { subtotal, flashSaleDiscount, volumeDiscount, bundleDiscount, flashSaleActive, flashSaleEligibleCount, total };
  }
}));
