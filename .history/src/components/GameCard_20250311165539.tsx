import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Check } from 'lucide-react';
import { Game } from '../types';
import { useStore } from '../store';
import { isFlashSaleEligible } from '../utils/gameHelpers';
import { useTheme } from '../context/ThemeContext';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [showVideo, setShowVideo] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout>();
  const addToCart = useStore((state) => state.addToCart);
  const { darkMode } = useTheme();
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();
  const { setFilters, setShowFilters } = useStore((state) => ({
    setFilters: state.setFilters,
    setShowFilters: state.setShowFilters,
  }));

  // Check if game is eligible for flash sale
  const isEligible = isFlashSaleEligible(game);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setShowVideo(true);
    }, 2000); // Show video after 2 seconds on hover
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    setShowVideo(false);
  };

  const videoId = game.Youtube_link?.split('v=')[1];

  // Updated platform icon mapping with proper typing
  const getPlatformIcon = (platform: string): string => {
    const platformMap: Record<string, string> = {
      'Nintendo 3DS': '3ds',
      'Nintendo Switch': 'switch',
      'Xbox 360': 'xbox360',
      'Xbox One': 'xbox_one',
      'Xbox Series X': 'seriesx',
      'PS3': 'ps3',
      'PS4': 'ps4',
      'PS5': 'ps5',
    };

    const baseName = platformMap[platform] || 'default';
    const themeSuffix = darkMode ? '' : '_black'; // Fixed: _black for dark mode
    return `/assets/icons/${baseName}${themeSuffix}.png`;
  };

  const handleClick = () => {
    addToCart(game);
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 1000); // Reset after 1 second
  };

  // Add click handler for platform icon
  const handlePlatformClick = (e: React.MouseEvent, platform: string) => {
    e.stopPropagation(); // Stop event propagation
    e.preventDefault(); // Prevent default link behavior
    setFilters({ platform }); // Set the platform filter
    setShowFilters(true); // Open the search/sort filter section
    navigate('/'); // Navigate to the main page

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-transform hover:scale-105 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Flash Sale Badge - Make it clickable */}
      {isEligible && (
        <Link
          to={`/flash-sale?platform=${game.Platform}`}
          className="absolute top-2 left-2 z-10"
        >
          <span className="inline-flex items-center bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            <Zap size={12} className="mr-1" />
            Flash Sale
          </span>
        </Link>
      )}

      <Link to={`/game/${game.id}`}>
        <div className="relative w-full pt-[88%]">
          {showVideo && videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <img
              src={game.image_url_medium}
              alt={game.Game_Title}
              className="absolute inset-0 w-full h-full object-contain bg-gray-100 dark:bg-gray-700"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent dark:from-black/20 dark:via-black/0">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-2 items-center">
                  {/* Clickable platform icon */}
                  <div 
                    className="gamecard-icon-container cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => handlePlatformClick(e, game.Platform)}
                  >
                    <img
                      src={getPlatformIcon(game.Platform)}
                      alt={game.Platform}
                      className="h-6 w-auto rounded"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                  <span className="px-2 py-1 bg-blue-500/80 rounded text-sm">
                    {`${game.Genre}${
                      game.Sub_Genre ? ` - ${game.Sub_Genre}` : ''
                    }`}
                  </span>
                </div>
                <span className="text-2xl font-bold">
                  ${game.Price_to_Sell_For}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">★</span>
                <span className="font-semibold">
                  Metacritic: {game.Metacritic_Score}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <button
        onClick={handleClick}
        className={`absolute top-2 right-2 p-2 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors ${
          isClicked ? 'bg-green-600 cursor-not-allowed' : ''
        }`}
        disabled={isClicked}
      >
        {isClicked ? <Check size={20} /> : <ShoppingCart size={20} className="group-hover:neon-wiggle" />}
      </button>
    </div>
  );
};