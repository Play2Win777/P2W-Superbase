import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { Gamepad as GameBit, Search, Check, Sparkles, Trophy } from 'lucide-react';
import { fetchGames } from './api';
import { useStore } from './store';
import { Filters } from './components/Filters';
import { GameCard } from './components/GameCard';
import { Cart } from './components/Cart';
import { GameDetails } from './pages/GameDetails';
import { Checkout } from './pages/Checkout';
import { FlashSalePage } from './pages/FlashSalePage';
import { DiscountPopup } from './components/DiscountPopup';

// 3. LOYALTY BADGE COMPONENT
const LoyaltyBadge = () => {
  const { loyaltyPoints, loyaltyTier } = useStore();
  
  const tierColors = {
    Bronze: 'bg-amber-700',
    Silver: 'bg-gray-400',
    Gold: 'bg-yellow-500',
    Platinum: 'bg-indigo-400'
  };
  
  return (
    <div className="flex flex-col items-center cursor-pointer" title={`${loyaltyPoints} points earned`}>
      <div className={`${tierColors[loyaltyTier]} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1`}>
        <Trophy className="h-3 w-3" />
        {loyaltyTier}
      </div>
      <div className="text-xs mt-1">{loyaltyPoints} pts</div>
    </div>
  );
};

// 4. CART UPGRADES FOR FREE SHIPPING
const CartUpgrades = () => {
  const { cart } = useStore();
  
  const freeShippingThreshold = 60;
  const cartTotal = cart.reduce((sum, game) => sum + game.Price, 0);
  const qualifiesForFreeShipping = cartTotal >= freeShippingThreshold;
  const amountToFreeShipping = freeShippingThreshold - cartTotal;
  
  return (
    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {!qualifiesForFreeShipping ? (
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full" 
                 style={{ width: `${Math.min(100, (cartTotal/freeShippingThreshold) * 100)}%` }}></div>
          </div>
          <span className="whitespace-nowrap text-sm">
            Add ${amountToFreeShipping.toFixed(2)} for free shipping
          </span>
        </div>
      ) : (
        <div className="text-green-600 dark:text-green-400 flex items-center gap-2">
          <Check className="h-5 w-5" />
          <span>You've unlocked FREE shipping!</span>
        </div>
      )}
    </div>
  );
};

// 5. GAME BUNDLES COMPONENT FOR GAME DETAILS PAGE
export const GameBundles = ({ currentGame }) => {
  const { games, addToCart } = useStore();
  
  // Find games by same developer or in same genre
  const relatedGames = games.filter(game => 
    (game.Developer === currentGame.Developer || 
     (game.Category && currentGame.Category && 
      game.Category.some(cat => currentGame.Category.includes(cat)))) && 
    game.id !== currentGame.id
  ).slice(0, 3);
  
  if (relatedGames.length < 2) return null;
  
  const bundleDiscount = 15;
  const bundlePrice = [...relatedGames, currentGame]
    .reduce((sum, game) => sum + game.Price, 0) * (1 - bundleDiscount/100);
  
  const handleAddBundle = () => {
    // Add all games in bundle to cart
    relatedGames.forEach(game => addToCart(game));
    addToCart(currentGame);
  };
  
  return (
    <div className="mt-8 border border-purple-200 dark:border-purple-900 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        Bundle & Save {bundleDiscount}%
      </h3>
      <div className="flex flex-wrap gap-4">
        {relatedGames.map(game => (
          <div key={game.id} className="flex items-center gap-2">
            <img src={game.Photo} alt={game.Game_Title} className="w-12 h-12 object-cover rounded" />
            <span>{game.Game_Title}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div>
          <p className="text-lg font-bold">${bundlePrice.toFixed(2)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Save ${(bundlePrice / (1 - bundleDiscount/100) - bundlePrice).toFixed(2)}</p>
        </div>
        <button 
          onClick={handleAddBundle}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg">
          Add Bundle to Cart
        </button>
      </div>
    </div>
  );
};

// SEARCH BAR COMPONENT
const SearchBar = () => {
  const { 
    games, 
    searchGames, 
    setFilteredGames, 
    setCurrentPage 
  } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (searchGames) {
      searchGames(term);
    } else {
      if (!term.trim()) {
        setFilteredGames(games);
      } else {
        const results = games.filter(game => 
          game.Game_Title.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredGames(results);
      }
    }
    
    setCurrentPage(1);
    
    if (location.pathname !== '/' && term.length >= 2) {
      navigate('/');
    }
  };
  
  return (
    <input
      type="text"
      placeholder="Search Games..."
      value={searchTerm}
      onChange={handleSearch}
      className="w-full px-3 py-2 border rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
    />
  );
};

// Header with navigation using React Router
const Header = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { loyaltyTier } = useStore();
  
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Update dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Use Link instead of raw elements with window.location */}
            <Link to="/" className="flex items-center gap-2">
              <GameBit className="text-purple-500 md:size-8 size-6" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap cursor-pointer">
                Play 2 Win
              </h1>
            </Link>
            <button
              onClick={toggleDarkMode}
              className="ml-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg whitespace-nowrap"
            >
              {darkMode ? (
                <span>Light...</span>
              ) : (
                <span>Dark Mode</span>
              )}
            </button>
            
            {/* Show loyalty badge */}
            <div className="ml-2">
              <LoyaltyBadge />
            </div>
            
            {/* Add DiscountPopup in header */}
            <div className="ml-2">
              <DiscountPopup />
            </div>
          </div>

          {/* Split the search input and button */}
          <div className="flex items-center w-1/2 md:w-auto">
            <div className="mr-2 flex-grow">
              <SearchBar />
            </div>
            {/* Original filter toggle button */}
            <button
              onClick={toggleFilters}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
          
          <Cart className="hidden md:block" />
        </div>
      </div>
    </header>
  );
};

// MAIN APP COMPONENT
function App() {
  const {
    games,
    filteredGames,
    currentPage,
    setGames,
    setFilteredGames,
    setCurrentPage,
  } = useStore();
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadGames = async () => {
      const fetchedGames = await fetchGames();
      const randomizedGames = [...fetchedGames].sort(() => Math.random() - 0.5);
      setGames(randomizedGames);
      setFilteredGames(randomizedGames);
    };

    loadGames();
  }, [setGames, setFilteredGames]);

  const gamesPerPage = 12;
  const paginatedGames = filteredGames.slice(0, currentPage * gamesPerPage);
  const hasMore = paginatedGames.length < filteredGames.length;

  // Main content component
  const HomePage = () => {
    return (
      <main className="container mx-auto px-4 py-4">
        {showFilters && (
          <div className="mb-6">
            <Filters />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-0">
          {paginatedGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Load More Games
            </button>
          </div>
        )}
      </main>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <HomePage />
              </>
            }
          />
          <Route 
            path="/game/:id" 
            element={
              <>
                <Header />
                <GameDetails />
              </>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <>
                <Header />
                <Checkout />
              </>
            } 
          />
          <Route 
            path="/flash-sale" 
            element={
              <>
                <Header />
                <FlashSalePage />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

// ENHANCED CART COMPONENT WITH UPGRADES
export const EnhancedCart = ({ className }) => {
  // Your existing Cart code here
  // Add at the end:
  return (
    <div className={className}>
      {/* Your existing cart content */}
      
      {/* Add the cart upgrades component */}
      <CartUpgrades />
    </div>
  );
};

export default App;
