import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, FilterState, Game } from './types';
import { fetchGames } from './api';
import { isFlashSaleEligible } from './utils/gameHelpers';

interface StoreState {
  games: Game[];
  filteredGames: Game[];
  currentPage: number;
  searchQuery: string;
  filters: FilterState;
  cart: CartItem[];
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  showFilters: boolean;
  toastMessage: string | null; // Add toastMessage state
  setGames: (games: Game[]) => void;
  setFilteredGames: (games: Game[]) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setShowFilters: (show: boolean) => void;
  addToCart: (game: Game) => void;
  removeFromCart: (gameId: string) => void;
  updateCartQuantity: (gameId: string, quantity: number) => void;
  fetchGames: () => void;
  getCartTotal: () => {
    subtotal: number;
    flashSaleDiscount: number;
    volumeDiscount: number;
    bundleDiscount: number;
    flashSaleActive: boolean;
    flashSaleEligibleCount: number;
    total: number;
  };
  clearToastMessage: () => void; // Add clearToastMessage function
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
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
      showFilters: false,
      toastMessage: null, // Initialize toastMessage

      setGames: (games) => set({ games }),
      setFilteredGames: (filteredGames) => set({ filteredGames }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      setShowFilters: (show) => set({ showFilters: show }),

      addToCart: (game) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.id === game.id);
          const pointsToAdd = Math.floor((game.Price_to_Sell_For || 0) * 10);
          const newPoints = state.loyaltyPoints + pointsToAdd;

          let newTier = state.loyaltyTier;
          if (newPoints >= 5000) newTier = 'Platinum';
          else if (newPoints >= 2000) newTier = 'Gold';
          else if (newPoints >= 500) newTier = 'Silver';
          else newTier = 'Bronze';

          const isEligible = isFlashSaleEligible(game);

          // Calculate next volume discount tier
          const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0) + 1;
          let nextDiscountTier = '';
          if (totalItems < 2) {
            nextDiscountTier = 'Add 1 more game for a 5% volume discount!';
          } else if (totalItems < 3) {
            nextDiscountTier = 'Add 1 more game for a 10% volume discount!';
          } else if (totalItems < 5) {
            nextDiscountTier = 'Add 2 more games for a 20% volume discount!';
          } else {
            nextDiscountTier = 'You’ve unlocked the maximum volume discount!';
          }

          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === game.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
              loyaltyPoints: newPoints,
              loyaltyTier: newTier,
              toastMessage: `${game.Game_Title} added to cart. ${nextDiscountTier}`, // Set toast message
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
                isFlashSaleEligible: isEligible,
                isBundleItem: game.isBundleItem || false,
                image_url_medium: game.image_url_medium,
              },
            ],
            loyaltyPoints: newPoints,
            loyaltyTier: newTier,
            toastMessage: `${game.Game_Title} added to cart. ${nextDiscountTier}`, // Set toast message
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

      getCartTotal: () => {
        const { cart } = get();

        // Separate items
        const bundleItems = cart.filter(item => item.isBundleItem);
        const nonBundleItems = cart.filter(item => !item.isBundleItem);

        // Calculate subtotals
        const bundleSubtotal = bundleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
        const nonBundleSubtotal = nonBundleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
        const subtotal = bundleSubtotal + nonBundleSubtotal;

        // Calculate flash sale discount
        const flashSaleItems = nonBundleItems.filter(item => item.isFlashSaleEligible);
        const flashSaleSubtotal = flashSaleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
        const flashSaleEligibleCount = flashSaleItems.reduce((count, item) => count + item.quantity, 0);
        const flashSaleActive = flashSaleEligibleCount >= 3;
        const flashSaleDiscount = flashSaleActive ? flashSaleSubtotal * 0.25 : 0;

        // Calculate volume discount
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        let volumeDiscountRate = 0;
        if (totalItems >= 5) volumeDiscountRate = 0.2;
        else if (totalItems >= 3) volumeDiscountRate = 0.1;
        else if (totalItems >= 2) volumeDiscountRate = 0.05;

        let volumeDiscount = 0;
        let bundleDiscount = 0;

        // Calculate the subtotal of items that are NOT flash sale eligible
        let nonFlashSubtotal = subtotal;
        if (flashSaleActive) {
          nonFlashSubtotal = subtotal - flashSaleSubtotal;
        }
        // Apply bundle discount if the bundle is intact
        const unbrokenBundle = bundleItems.length === cart.length && cart.length === 4;

        if (unbrokenBundle) {
          bundleDiscount = bundleSubtotal * 0.15;
        } else {
          volumeDiscount = nonFlashSubtotal * volumeDiscountRate;
        }

        const total = subtotal - flashSaleDiscount - volumeDiscount - bundleDiscount;

        return {
          subtotal,
          flashSaleDiscount,
          volumeDiscount,
          bundleDiscount,
          flashSaleActive,
          flashSaleEligibleCount,
          total,
        };
      },

      clearToastMessage: () => set({ toastMessage: null }), // Clear toast message
    }),
    {
      name: 'game-store',
      partialize: (state) => ({
        cart: state.cart,
        loyaltyPoints: state.loyaltyPoints,
        loyaltyTier: state.loyaltyTier,
      }),
    }
  )
);