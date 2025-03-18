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

// Load Storylane script
useEffect(() => {
  const script = document.createElement('script');
  script.src = "https://js.storylane.io/js/v2/storylane.js";
  script.async = true;
  document.head.appendChild(script);
}, []);

const StorylaneButton = () => (
  <button
    onClick={() => {
      if (window.Storylane) {
        window.Storylane.Play({
          type: 'popup',
          demo_type: 'image',
          width: 1920,
          height: 959,
          scale: '0.95',
          demo_url: 'https://app.storylane.io/demo/gc4nsbbb2ugi?embed=popup',
          padding_bottom: 'calc(49.95% + 25px)'
        });
      }
    }}
    className="sl-preview-cta bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700"
  >
    Click to learn how to use this website
  </button>
);

const Footer = ({ toggleDarkMode, darkMode }) => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-8 py-4 overflow-visible">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <button
          onClick={toggleDarkMode}
          className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg"
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <DiscountPopup />
        <StorylaneButton />
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
  } = useStore();

  const [darkMode, setDarkMode] = useState(true);
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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <Router>
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="container mx-auto px-4 py-1 flex justify-between items-center">
              <h1 onClick={() => window.location.href = '/'} className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer flex items-center">
                <img src="/assets/icons/p2wlogo.png" alt="Play 2 Win" className="h-16 mr-3" />
              </h1>
              <Cart className="hidden md:block" />
            </div>
          </header>
          <Routes>
            <Route path="/" element={<main className="container mx-auto px-4 py-4">
              {showFilters && <Filters />}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGames.slice(0, currentPage * 12).map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
              {filteredGames.length > currentPage * 12 && (
                <button onClick={() => setCurrentPage(currentPage + 1)} className="bg-purple-500 text-white px-6 py-2 rounded-lg mt-8">Load More Games</button>
              )}
            </main>} />
            <Route path="/game/:id" element={<GameDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/flash-sale" element={<FlashSalePage />} />
          </Routes>
          <Footer toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
