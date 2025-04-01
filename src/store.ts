import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, FilterState, Game } from './types';
import { fetchGames } from './api';
import {
  isFlashSaleEligible,
  isIntroSaleEligible,
  getIntroSaleDiscountRate,
  isFlashSaleActive,
  getVolumeDiscountRate,
} from './utils/gameHelpers';

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
  toastMessage: string | null;
  toastDiscountInfo: string | null;
  setGames: (games: Game[]) => void;
  setFilteredGames: (games: Game[]) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setShowFilters: (show: boolean) => void;
  setToastMessage: (message: string | null) => void;
  setToastDiscountInfo: (info: string | null) => void;
  addToCart: (game: Game) => void;
  removeFromCart: (gameId: string) => void;
  updateCartQuantity: (gameId: string, quantity: number) => void;
  fetchGames: () => void;
  getCartTotal: () => {
    subtotal: number;
    flashSaleDiscount: number;
    introSaleDiscount: number;
    volumeDiscount: number;
    bundleDiscount: number;
    flashSaleActive: boolean;
    flashSaleEligibleCount: number;
    total: number;
  };
  getNextVolumeDiscountInfo: () => string;
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
      toastMessage: null,
      toastDiscountInfo: null,

      setGames: (games) => set({ games }),
      setFilteredGames: (filteredGames) => set({ filteredGames }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      setShowFilters: (show) => set({ showFilters: show }),
      setToastMessage: (message) => set({ toastMessage: message }),
      setToastDiscountInfo: (info) => set({ toastDiscountInfo: info }),

      getNextVolumeDiscountInfo: () => {
        const { cart } = get();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      
        if (totalItems >= 4) {
          return "Maximum discount achieved!";
        } else if (totalItems >= 3) {
          return "Add 1 more game for 20% off!";
        } else if (totalItems >= 2) {
          return "Add 2 more game for 20% off!";
        } else if (totalItems >= 1) {
          return "Add 1 more game for 10% off!";
        } else {
          return "Add 1 more game for 5% off!";
        }
      },

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

          // Set toast message
          const toastMessage = `${game.Game_Title} added to cart!`;
          const toastDiscountInfo = state.getNextVolumeDiscountInfo();

          setTimeout(() => {
            set({ toastMessage: null, toastDiscountInfo: null });
          }, 3000);

          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === game.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
              loyaltyPoints: newPoints,
              loyaltyTier: newTier,
              toastMessage,
              toastDiscountInfo,
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
                Platform: game.Platform, // Ensure Platform is included
              },
            ],
            loyaltyPoints: newPoints,
            loyaltyTier: newTier,
            toastMessage,
            toastDiscountInfo,
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

        // Separate Intro Sale eligible items
        const introSaleItems = nonBundleItems.filter(item => isIntroSaleEligible(item));
        const introSaleSubtotal = introSaleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
        const introSaleCount = introSaleItems.reduce((count, item) => count + item.quantity, 0);

        // Calculate Intro Sale discount rate
        const introSaleDiscountRate = getIntroSaleDiscountRate(introSaleCount);

        // Separate Flash Sale eligible items (including those that are also Intro Sale eligible)
        const flashSaleItems = nonBundleItems.filter(item => item.isFlashSaleEligible);
        const flashSaleEligibleCount = flashSaleItems.reduce((count, item) => count + item.quantity, 0);

        // Determine if Flash Sale is active
        const flashSaleActive = isFlashSaleActive(flashSaleEligibleCount);

        // Calculate discounts for dual-eligible items (Flash Sale and Intro Sale)
        let flashSaleDiscount = 0;
        let introSaleDiscount = 0;

        for (const item of nonBundleItems) {
          const isIntro = isIntroSaleEligible(item);
          const isFlash = item.isFlashSaleEligible;

          if (isIntro && isFlash) {
            // Dual-eligible item: apply the higher discount
            const introDiscount = item.Price_to_Sell_For * item.quantity * introSaleDiscountRate;
            const flashDiscount = flashSaleActive ? item.Price_to_Sell_For * item.quantity * 0.25 : 0;

            if (flashDiscount > introDiscount) {
              flashSaleDiscount += flashDiscount;
            } else {
              introSaleDiscount += introDiscount;
            }
          } else if (isIntro) {
            // Intro Sale only
            introSaleDiscount += item.Price_to_Sell_For * item.quantity * introSaleDiscountRate;
          } else if (isFlash && flashSaleActive) {
            // Flash Sale only
            flashSaleDiscount += item.Price_to_Sell_For * item.quantity * 0.25;
          }
        }

        // Determine Volume Discount rate (based on total items in cart)
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const volumeDiscountRate = getVolumeDiscountRate(totalItems);

        // Calculate Volume Discount
        let volumeDiscount = 0;
        if (flashSaleActive) {
          // Apply Volume Discount only to non-flash sale and non-intro sale items
          const volumeDiscountItems = nonBundleItems.filter(item => !item.isFlashSaleEligible && !isIntroSaleEligible(item));
          const volumeDiscountSubtotal = volumeDiscountItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
          volumeDiscount = volumeDiscountSubtotal * volumeDiscountRate;
        } else {
          // Apply Volume Discount to all items except Intro Sale eligible items
          const volumeDiscountItems = nonBundleItems.filter(item => !isIntroSaleEligible(item));
          const volumeDiscountSubtotal = volumeDiscountItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
          volumeDiscount = volumeDiscountSubtotal * volumeDiscountRate;
        }

        // Apply bundle discount if the bundle is intact
        const unbrokenBundle = bundleItems.length === cart.length && cart.length === 4;
        const bundleDiscount = unbrokenBundle ? bundleSubtotal * 0.15 : 0;

        // Calculate total
        const total = subtotal - flashSaleDiscount - introSaleDiscount - volumeDiscount - bundleDiscount;

        return {
          subtotal,
          flashSaleDiscount,
          introSaleDiscount,
          introSaleDiscountRate,
          volumeDiscount,
          bundleDiscount,
          flashSaleActive,
          flashSaleEligibleCount,
          total,
        };
      },
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
