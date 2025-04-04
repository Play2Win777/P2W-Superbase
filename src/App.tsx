// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, Zap, X, ShoppingCart, Filter, ArrowRight, Check, HelpCircle, Tag } from 'lucide-react';
import { fetchGames } from './api';
import { useStore } from './store';
import { Filters } from './components/Filters';
import { GameCard } from './components/GameCard';
import { Cart } from './components/Cart';
import { GameDetails } from './pages/GameDetails';
import { Checkout } from './pages/Checkout';
import { FlashSalePage } from './pages/FlashSalePage';
import { IntroSalePage } from './pages/IntroSalePage';
import { DiscountPopup } from './components/DiscountPopup';
import { ThemeContext } from './context/ThemeContext';
import { Toast } from './components/Toast';
import { ExchangeRateProvider } from './context/ExchangeRateContext';
import { GameCardSkeleton } from './components/GameCardSkeleton';
import { lazy, Suspense } from 'react';



// IntroModal Component
const IntroModal = ({ isOpen, onClose }) => {
  const [isBrowseOpen, setIsBrowseOpen] = useState(false); // Start collapsed
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false); // Start collapsed
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // Start collapsed

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose} // Close modal when clicking outside
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full max-h-[70vh] flex flex-col shadow-lg transform transition-all duration-300 ease-out animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        {/* Fixed Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Zap size={24} className="text-orange-500" />
            Welcome to P2W Games!
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Collapsible Section: How to Browse Games */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsBrowseOpen(!isBrowseOpen)}
              className="flex items-center gap-2 text-left dark:text-white"
            >
              <Search size={20} className="flex-shrink-0 text-purple-500" />
              <p className="font-semibold">1. How to Browse Games</p>
              <span className="ml-auto transform transition-transform">
                {isBrowseOpen ? '▼' : '▶'}
              </span>
            </button>
            {isBrowseOpen && (
              <ul className="list-disc pl-10 text-gray-700 dark:text-gray-300">
                <li>Click <strong>platform icons</strong> to filter by platform.</li>
                <li>Use the search "<Search size={16} className="inline" />" button at the top to apply filters like platform, genre, price, and more.</li>
              </ul>
            )}
          </div>

          {/* Collapsible Section: How to Add to Cart */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsAddToCartOpen(!isAddToCartOpen)}
              className="flex items-center gap-2 text-left dark:text-white"
            >
              <ShoppingCart size={20} className="flex-shrink-0 text-green-500" />
              <p className="font-semibold">2. How to Add to Cart</p>
              <span className="ml-auto transform transition-transform">
                {isAddToCartOpen ? '▼' : '▶'}
              </span>
            </button>
            {isAddToCartOpen && (
              <ul className="list-disc pl-10 text-gray-700 dark:text-gray-300">
                <li>Click the <ShoppingCart size={16} className="inline" /> button to add games to your cart.</li>
                <li>Look for <Zap size={16} className="inline text-orange-500" /> Flash Sale badges for discounted games.</li>
              </ul>
            )}
          </div>

          {/* Collapsible Section: How to Get Your Games */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsCheckoutOpen(!isCheckoutOpen)}
              className="flex items-center gap-2 text-left dark:text-white"
            >
              <Check size={20} className="flex-shrink-0 text-blue-500" />
              <p className="font-semibold">3. How to Get Your Games</p>
              <span className="ml-auto transform transition-transform">
                {isCheckoutOpen ? '▼' : '▶'}
              </span>
            </button>
            {isCheckoutOpen && (
              <ul className="list-disc pl-10 text-gray-700 dark:text-gray-300">
                <li>Go to your cart at the top right <ShoppingCart size={16} className="inline" /> and review your items.</li>
                <li>Choose <strong>WhatsApp</strong> at checkout and you can pay in person in SRD.</li>
              </ul>
            )}
          </div>
        </div>

        {/* Fixed Footer: Special Xbox Sale Announcement */}
        <Link to="/intro-sale" // Use the `to` prop for React Router
        className="block bg-yellow-100 dark:bg-cyan-900 p-4 rounded-lg mt-4 hover:bg-yellow-200 dark:hover:bg-cyan-800 transition-colors">
          <div className="flex items-start gap-3">
          <Zap size={20} className="flex-shrink-0 mt-1 text-orange-500" />
            <div>
              <p className="font-semibold dark:text-white">Special Xbox One Sale!</p>
              <p className="text-sm dark:text-gray-300">
        For every Xbox One game you add to your cart, you get <strong>5% off</strong> on those games. <strong>Get up to 55% off.</strong>
              </p>
            </div>
          </div>
        </Link>

        {/* Volume Discount Section */}
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-500 rounded-lg">
          <p className="text-sm text-purple-700 dark:text-purple-200 flex items-center gap-2">
            <Tag size={16} className="text-purple-500 dark:text-purple-300" />
            <strong>Volume Discount:</strong> Get up to 20% off any games you add to your cart!
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <ArrowRight size={18} />
            Let's Get Started!
          </button>
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

// Whatsapp COMPONENT
const FloatingWhatsAppButton = () => {
  const phoneNumber = "+5978574777";
  const message = "Hello! I have a question about P2W Games.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-green-500 dark:hover:bg-green-500 transition-all duration-300 hover:scale-110"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        className="w-8 h-8 opacity-75 hover:opacity-100 transition-opacity"
      />
    </a>
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
  const [isLoading, setIsLoading] = useState(true); // Add loading state
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
    toastMessage,
    toastDiscountInfo,
  } = useStore();
  
  const [darkMode, setDarkMode] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);

  // Show intro modal on first visit
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setShowIntroModal(true);
      localStorage.setItem('hasSeenIntro', 'true');
    }
  }, []);

  useEffect(() => {
    const loadGames = async () => {
      setIsLoading(true); // Start loading
      try {
      const fetchedGames = await fetchGames();
      const randomizedGames = [...fetchedGames].sort(() => Math.random() - 0.5);
      setGames(randomizedGames);
      setFilteredGames(randomizedGames);
    } finally {
      setIsLoading(false); // Stop loading
    }
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

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    if (!showFilters) {
      setIsScrolling(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setIsScrolling(true);
      }, 1000);
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
      <ExchangeRateProvider>
        <Router>
          <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header (renders immediately) */}
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h1 
                      onClick={() => window.location.href = '/'} 
                      className="text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap cursor-pointer flex items-center"
                    >
                      <img src="/assets/icons/p2wlogo_small.webp" alt="Play 2 Win" className="h-12 mr-3" />
                    </h1>
                  </div>

                  <div className="flex items-center w-1/2 md:w-auto">
                    <div className="mr-2 flex-grow">
                      <SearchBar />
                    </div>
                    <button
                      onClick={toggleFilters}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowIntroModal((prev) => !prev)} // Toggle modal
                    className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors shadow-lg relative group"
                  >
                    <HelpCircle size={24} />
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      How it works
                    </div>
                  </button>

                  <Cart className="hidden md:block" />
                </div>
              </div>
            </header>

            {/* Intro Modal */}
            <IntroModal
              isOpen={showIntroModal}
              onClose={() => setShowIntroModal(false)}
            />

             {/* Floating WhatsApp Button */}
             <FloatingWhatsAppButton />
             
            {/* Toast */}
            {toastMessage && (
              <Toast 
                message={toastMessage} 
                discountInfo={toastDiscountInfo || undefined}
              />
            )}
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
                      {/* Show skeleton while loading */}
                      {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                          <GameCardSkeleton key={`skeleton-${i}`} />
                        ))
                      ) : (
                       paginatedGames.map((game) => (
                        <GameCard key={game.id} game={game} />
                      ))
                    )}
                    </div>
                    {!isLoading && hasMore && (
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
              <Route path="/intro-sale" element={<IntroSalePage />} />
              
            </Routes>

            <Footer toggleDarkMode={themeValue.toggleDarkMode} darkMode={darkMode} />
          </div>
        </Router>
      </ExchangeRateProvider>
    </ThemeContext.Provider>
  );
}

export default App;