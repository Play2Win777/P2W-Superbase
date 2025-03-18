// App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Search, Zap, X, ShoppingCart, Filter, ArrowRight, Check } from 'lucide-react'; // Added missing icons
import { fetchGames } from './api';
import { useStore } from './store';
import { Filters } from './components/Filters';
import { GameCard } from './components/GameCard';
import { Cart } from './components/Cart';
import { GameDetails } from './pages/GameDetails';
import { Checkout } from './pages/Checkout';
import { FlashSalePage } from './pages/FlashSalePage';
import { DiscountPopup } from './components/DiscountPopup';
import { ThemeContext } from './context/ThemeContext';

// IntroModal Component
const IntroModal = () => {
  const [isOpen, setIsOpen] = useState(!localStorage.getItem('hasSeenIntro'));

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenIntro', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md shadow-lg">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Zap size={24} className="text-orange-500" />
            Welcome to P2W Games!
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="text-gray-700 dark:text-gray-300 space-y-4">
          {/* Step 1: Browse Games */}
          <div className="flex items-start gap-3">
            <Search size={20} className="flex-shrink-0 mt-1 text-purple-500" />
            <div>
              <p className="font-semibold">1. Browse Games</p>
              <ul className="list-disc pl-5">
                <li>Use the <strong>search bar</strong> to find specific games.</li>
                <li>Click <strong>platform icons</strong> to filter by platform.</li>
                <li>Use the <Search color="purple 400" size={16} className="inline" /> button to apply filters like genre, price, and more.</li>
              </ul>
            </div>
          </div>

          {/* Step 2: Add to Cart */}
          <div className="flex items-start gap-3">
            <ShoppingCart size={20} className="flex-shrink-0 mt-1 text-green-500" />
            <div>
              <p className="font-semibold">2. Add to Cart</p>
              <ul className="list-disc pl-5">
                <li>Click the <ShoppingCart size={16} className="inline" /> button to add games to your cart.</li>
                <li>Look for <Zap size={16} className="inline text-orange-500" /> Flash Sale badges for discounted games.</li>
                <li>Add <strong>3+ Flash Sale items</strong> to unlock a <strong>25% discount</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Step 3: Checkout */}
          <div className="flex items-start gap-3">
            <Check size={20} className="flex-shrink-0 mt-1 text-blue-500" />
            <div>
              <p className="font-semibold">3. Checkout</p>
              <ul className="list-disc pl-5">
                <li>Go to your cart and review your items.</li>
                <li>Enjoy <strong>volume discounts</strong> for buying multiple games.</li>
                <li>Checkout via <strong>WhatsApp</strong> or <strong>credit card</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={closeModal}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <ArrowRight size={18} />
              Let's Get Started!
            </button>
          </div>
        </div>
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
    
    // Reset to first page when searching
    setCurrentPage(1);
    
    // If user is not on the home page and they've typed at least 2 characters, navigate to home
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

// FOOTER COMPONENT
const Footer = ({ toggleDarkMode, darkMode }) => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-8 py-4 overflow-visible">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Dark Mode Toggle on the left */}
        <button
          onClick={toggleDarkMode}
          className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg whitespace-nowrap"
        >
          {darkMode ? (
            <span>Light Mode</span>
          ) : (
            <span>Dark Mode</span>
          )}
        </button>

        {/* Add DiscountPopup button to the footer */}
        <div className="ml-4">
          <DiscountPopup />
        </div>
      </div>
    </footer>
  );
};

function App() {
  const {
    games,
    filteredGames,
    currentPage,
    setGames,
    setFilteredGames,
    setCurrentPage,
    showFilters,
    setShowFilters,
    filters,
  } = useStore();
  
  const [darkMode, setDarkMode] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false); // Track if the user is scrolling

  useEffect(() => {
    const loadGames = async () => {
      const fetchedGames = await fetchGames();
      const randomizedGames = [...fetchedGames].sort(() => Math.random() - 0.5);
      setGames(randomizedGames);
      setFilteredGames(randomizedGames);
    };

    loadGames();
  }, [setGames, setFilteredGames]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Add scroll event listener to close filters when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      if (showFilters && window.scrollY > 100 && isScrolling) { // Only close filters if user is actively scrolling
        setShowFilters(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showFilters, isScrolling]);

  // Open filters when platform filter is set
  useEffect(() => {
    if (filters.platform) {
      setShowFilters(true); // Open filters when platform is set
    }
  }, [filters.platform]); // Watch for changes to filters.platform

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);

    // Scroll to the top of the page when filters are opened
    if (!showFilters) {
      setIsScrolling(false); // Disable auto-close temporarily
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Re-enable auto-close after a short delay
      setTimeout(() => {
        setIsScrolling(true);
      }, 1000); // Adjust the delay as needed
    }
  };

  const gamesPerPage = 12;
  const paginatedGames = filteredGames.slice(0, currentPage * gamesPerPage);
  const hasMore = paginatedGames.length < filteredGames.length;

  const themeValue = {
    darkMode,
    toggleDarkMode: () => setDarkMode(prev => !prev)
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <Router>
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Add IntroModal here */}
          <IntroModal />
          <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h1 
                    onClick={() => window.location.href = '/'} 
                    className="text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap cursor-pointer flex items-center"
                  >
                    <img src="/assets/icons/p2wlogo.png" alt="Play 2 Win" className="h-16 mr-3" />
                  </h1>
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

          <Routes>
            <Route
              path="/"
              element={
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
              }
            />
            <Route path="/game/:id" element={<GameDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/flash-sale" element={<FlashSalePage />} />
          </Routes>

          {/* Footer with Dark Mode Toggle and DiscountPopup */}
          <Footer toggleDarkMode={themeValue.toggleDarkMode} darkMode={darkMode} />
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;