import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // ✅ Added persistence
import { CartItem, FilterState, Game } from './types';
import { fetchGames } from './api';
import { isFlashSaleEligible } from './utils/gameHelpers';

// Update the StoreState interface to include persistence and ensure cart stability
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
  getCartTotal: () => {
    subtotal: number;
    flashSaleDiscount: number;
    volumeDiscount: number;
    bundleDiscount: number;
    flashSaleActive: boolean;
    flashSaleEligibleCount: number;
    total: number;
  };
}

// ✅ Wrapped store with `persist` to keep cart and loyalty data after reloads
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

      setGames: (games) => set({ games }),
      setFilteredGames: (filteredGames) => set({ filteredGames }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      // ✅ Persisting cart & loyalty points
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
                isFlashSaleEligible: isEligible,
                isBundleItem: game.isBundleItem || false, // ✅ Ensure `isBundleItem` is not undefined
                image_url_medium: game.image_url_medium,
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

      getCartTotal: () => {
        const { cart } = get();

        const flashSaleItems = cart.filter(item => item.isFlashSaleEligible);
        const regularItems = cart.filter(item => !item.isFlashSaleEligible);
        const bundleItems = cart.filter(item => item.isBundleItem);

        const flashSaleSubtotal = flashSaleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
        const regularSubtotal = regularItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
        const bundleSubtotal = bundleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);

        const flashSaleEligibleCount = flashSaleItems.reduce((count, item) => count + item.quantity, 0);
        const flashSaleActive = flashSaleEligibleCount >= 3;
        let flashSaleDiscount = flashSaleActive ? flashSaleSubtotal * 0.25 : 0;

        const bundleDiscount = bundleSubtotal * 0.15;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        let volumeDiscountRate = totalItems >= 5 ? 0.2 : totalItems >= 3 ? 0.1 : totalItems >= 2 ? 0.05 : 0;
        const volumeDiscount = regularSubtotal * volumeDiscountRate;

        const subtotal = flashSaleSubtotal + regularSubtotal + bundleSubtotal;
        const total = subtotal - flashSaleDiscount - volumeDiscount - bundleDiscount;

        return { subtotal, flashSaleDiscount, volumeDiscount, bundleDiscount, flashSaleActive, flashSaleEligibleCount, total };
      }
    }),

    {
      name: 'game-store', // ✅ Unique key for local storage
      partialize: (state) => ({
        cart: state.cart, // ✅ Persist cart
        loyaltyPoints: state.loyaltyPoints, // ✅ Persist loyalty points
        loyaltyTier: state.loyaltyTier, // ✅ Persist loyalty tier
      }),
    }
  )
);
