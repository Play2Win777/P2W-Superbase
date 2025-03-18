import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Gamepad as GameBit, Search } from 'lucide-react';
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

const SearchBar = () => {
  // ... keep existing SearchBar implementation ...
};

const Footer = ({ toggleDarkMode, darkMode }) => {
  // ... keep existing Footer implementation ...
};

function App() {
  const {
    games,
    filteredGames,
    currentPage,
    setGames,
    setFilteredGames,
    setCurrentPage,
  } = useStore();
  
  // State declarations first
  const [darkMode, setDarkMode] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Theme context value - MUST be declared after state
  const themeValue = {
    darkMode,
    toggleDarkMode: () => setDarkMode(prev => !prev)
  };

  // Storylane script loading
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.storylane.io/js/v2/storylane.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Game loading effect
  useEffect(() => {
    const loadGames = async () => {
      const fetchedGames = await fetchGames();
      const randomizedGames = [...fetchedGames].sort(() => Math.random() - 0.5);
      setGames(randomizedGames);
      setFilteredGames(randomizedGames);
    };
    loadGames();
  }, [setGames, setFilteredGames]);

  // Dark mode effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleFilters = () => setShowFilters(!showFilters);

  const gamesPerPage = 12;
  const paginatedGames = filteredGames.slice(0, currentPage * gamesPerPage);
  const hasMore = paginatedGames.length < filteredGames.length;

  return (
    <ThemeContext.Provider value={themeValue}>
      <Router>
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            {/* ... keep existing header JSX ... */}
          </header>

          <Routes>
            <Route
              path="/"
              element={
                <main className="container mx-auto px-4 py-4">
                  {/* Storylane Demo Embed */}
                  <div className="mb-8" style={{ 
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(63,95,172,0.35)',
                    boxShadow: '0px 0px 18px rgba(26, 19, 72, 0.15)',
                    borderRadius: '10px'
                  }}>
                    {/* ... Storylane embed JSX ... */}
                  </div>

                  {showFilters && <Filters />}
                  
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

          <Footer toggleDarkMode={themeValue.toggleDarkMode} darkMode={darkMode} />
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;