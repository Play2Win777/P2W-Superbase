// store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game, CartItem, FilterState, StoreState } from './types';
import { fetchGames } from './api';
import { isFlashSaleEligible } from './utils/gameHelpers';

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
            image_url_medium: game.image_url_medium, // Make sure images are included
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
    
    // Split cart into flash sale, bundle, and regular items
    const flashSaleItems = cart.filter(item => item.isFlashSaleEligible);
    const bundleItems = cart.filter(item => item.isBundleItem);
    const regularItems = cart.filter(item => !item.isFlashSaleEligible && !item.isBundleItem);

    // Count flash sale eligible items
    const flashSaleEligibleCount = flashSaleItems.reduce((count, item) => {
      return count + item.quantity;
    }, 0);

    // Check if flash sale should be active (3+ eligible items)
    const flashSaleActive = flashSaleEligibleCount >= 3;

    // Calculate subtotals
    const flashSaleSubtotal = flashSaleItems.reduce((sum, item) => {
      return sum + (item.Price_to_Sell_For * item.quantity);
    }, 0);

    const bundleSubtotal = bundleItems.reduce((sum, item) => {
      return sum + (item.Price_to_Sell_For * item.quantity);
    }, 0);

    const regularSubtotal = regularItems.reduce((sum, item) => {
      return sum + (item.Price_to_Sell_For * item.quantity);
    }, 0);

    const subtotal = flashSaleSubtotal + bundleSubtotal + regularSubtotal;

    // Calculate flash sale discounts (25% off eligible games) - only if 3+ eligible items
    let flashSaleDiscount = 0;
    if (flashSaleActive) {
      flashSaleDiscount = flashSaleSubtotal * 0.25;
    }

    // Calculate volume discount based on total items, but only apply to regular items
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    let volumeDiscountRate = 0;
    if (totalItems >= 5) {
      volumeDiscountRate = 0.2; // 20%
    } else if (totalItems >= 3) {
      volumeDiscountRate = 0.1; // 10%
    } else if (totalItems >= 2) {
      volumeDiscountRate = 0.05; // 5%
    }

    const volumeDiscount = regularSubtotal * volumeDiscountRate;

    // Calculate bundle discount (15% off bundle items)
    const bundleDiscount = bundleSubtotal * 0.15; // 15% off

    // Calculate final total
    const total = subtotal - flashSaleDiscount - volumeDiscount - bundleDiscount;

    return {
      subtotal,
      flashSaleDiscount,
      volumeDiscount,
      bundleDiscount, // Add this line
      flashSaleActive,
      flashSaleEligibleCount,
      total
    };
  }
}));