import { create } from 'zustand';
import { CartItem, FilterState, Game } from './types';
import { fetchGames } from './api';

// Update the StoreState interface to include loyalty features
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
    
  // Enhanced addToCart that also awards loyalty points
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
}));
