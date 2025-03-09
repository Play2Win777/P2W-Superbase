import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Zap } from 'lucide-react';
import { Game } from '../types';
import { useStore } from '../store';
import { isFlashSaleEligible } from '../utils/gameHelpers';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [showVideo, setShowVideo] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout>();
  const addToCart = useStore((state) => state.addToCart);
  
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

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-transform hover:scale-105 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Flash Sale Badge - Added at top left */}
      {isEligible && (
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            <Zap size={12} className="mr-1" />
            Flash Sale
          </span>
        </div>
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
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-purple-500/80 rounded text-sm">
                    {game.Platform}
                  </span>
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
        onClick={() => addToCart(game)}
        className="absolute top-2 right-2 p-2 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
      >
        <ShoppingCart size={20} className="group-hover:neon-wiggle" />
      </button>
    </div>
  );
};