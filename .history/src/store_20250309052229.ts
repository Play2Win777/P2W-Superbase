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
                                isBundleItem: game.isBundleItem || false,
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

                let subtotal = 0;
                let flashSaleDiscount = 0;
                let volumeDiscount = 0;
                let bundleDiscount = 0;

                const bundleItems = cart.filter(item => item.isBundleItem);
                const nonBundleItems = cart.filter(item => !item.isBundleItem);
                const flashSaleItems = nonBundleItems.filter(item => item.isFlashSaleEligible);

                // Calculate Subtotal
                cart.forEach(item => {
                    subtotal += item.Price_to_Sell_For * item.quantity;
                });

                // Calculate Flash Sale Discount
                const flashSaleSubtotal = flashSaleItems.reduce((sum, item) => sum + (item.Price_to_Sell_For * item.quantity), 0);
                const flashSaleEligibleCount = flashSaleItems.reduce((count, item) => count + item.quantity, 0);
                const flashSaleActive = flashSaleEligibleCount >= 3;

                if (flashSaleActive) {
                    flashSaleDiscount = flashSaleSubtotal * 0.25;
                }

                // Calculate Volume Discount
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                let volumeDiscountRate = 0;

                if (totalItems >= 5) volumeDiscountRate = 0.2;
                else if (totalItems >= 3) volumeDiscountRate = 0.1;
                else if (totalItems >= 2) volumeDiscountRate = 0.05;

                // Calculate Volume Discount based on the remaining amount after Flash Sale discount
                const discountedSubtotal = subtotal - flashSaleDiscount;

                if (totalItems >= 2) {
                    volumeDiscount = discountedSubtotal * volumeDiscountRate;
                }

                // Calculate Bundle Discount (Lowest Priority)
                const unbrokenBundle = bundleItems.length > 0 && totalItems === bundleItems.length;
                 if (unbrokenBundle) {
                     bundleDiscount = subtotal * 0.15;
                 }

                let total = subtotal - flashSaleDiscount - volumeDiscount - bundleDiscount;

                return {
                    subtotal,
                    flashSaleDiscount,
                    volumeDiscount,
                    bundleDiscount,
                    flashSaleActive,
                    flashSaleEligibleCount,
                    total
                };
            }
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
