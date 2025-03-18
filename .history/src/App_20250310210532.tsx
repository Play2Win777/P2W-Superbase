// App.tsx
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

// ... Keep SearchBar and Footer components unchanged ...

function App() {
  // ... Keep existing state and effects ...

  // Storylane play handler
  const launchStorylanePopup = () => {
    if ((window as any).Storylane) {
      (window as any).Storylane.Play({
        type: 'popup',
        demo_type: 'image',
        width: 1920,
        height: 959,
        scale: '0.95',
        demo_url: 'https://app.storylane.io/demo/gc4nsbbb2ugi?embed=popup',
        padding_bottom: 'calc(49.95% + 25px)'
      });
    }
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <Router>
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <header>{/* Keep header unchanged */}</header>

          <Routes>
            <Route
              path="/"
              element={
                <main className="container mx-auto px-4 py-4">
                  {/* Original Embed */}
                  <div className="mb-8" style={{/* Keep original styles */}}>
                    {/* Original iframe */}
                  </div>

                  {/* Second Embed (Overlay Version) */}
                  <div className="mb-8" style={{/* Keep previous overlay styles */}}>
                    {/* Previous overlay content */}
                  </div>

                  {/* Third Embed (Popup Button) */}
                  <div className="mb-8 text-center">
                    <button
                      onClick={launchStorylanePopup}
                      style={{
                        backgroundColor: '#9939EB',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0px 0px 15px rgba(26, 19, 72, 0.45)',
                        color: '#FFFFFF',
                        display: 'inline-block',
                        fontFamily: 'Poppins, Arial, sans-serif',
                        fontSize: 'clamp(16px, 1.599vw, 20px)',
                        fontWeight: 600,
                        height: 'clamp(40px, 3.996vw, 50px)',
                        lineHeight: 1.2,
                        padding: '0 clamp(15px, 1.776vw, 20px)',
                        textOverflow: 'ellipsis',
                        transform: 'translateZ(0)',
                        transition: 'background 0.4s',
                        whiteSpace: 'nowrap',
                        width: 'auto',
                        cursor: 'pointer',
                        margin: '20px 0'
                      }}
                    >
                      TAKE A TOUR
                    </button>
                  </div>

                  {/* Rest of homepage content */}
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
            {/* Other routes remain unchanged */}
          </Routes>
          <Footer />
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;