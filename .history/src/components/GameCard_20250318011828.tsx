import React, { useState, useRef, useEffect } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [isCenterCard, setIsCenterCard] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout>();
  const autoplayTimer = useRef<NodeJS.Timeout>();
  const cardRef = useRef<HTMLDivElement>(null);
  const addToCart = useStore((state) => state.addToCart);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { setFilters, setShowFilters } = useStore((state) => ({
    setFilters: state.setFilters,
    setShowFilters: state.setShowFilters,
  }));
  const videoId = game.Youtube_link?.split('v=')[1]?.split('&')[0];
  const isEligible = isFlashSaleEligible(game);

  // Handle desktop hover functionality
  const handleMouseEnter = () => {
    if (window.innerWidth > 768) {
      setIsHovered(true);
      hoverTimer.current = setTimeout(() => {
        setShowVideo(true);
      }, 1000);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) {
      setIsHovered(false);
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
      setShowVideo(false);
    }
  };

  // Handle mobile scroll detection
  useEffect(() => {
    const checkIfCenter = () => {
      if (!cardRef.current || window.innerWidth > 768) return;

      const rect = cardRef.current.getBoundingClientRect();
      const windowCenter = window.innerHeight / 2;
      const cardCenter = rect.top + rect.height / 2;
      const isCenter = Math.abs(windowCenter - cardCenter) < rect.height / 2;

      if (isCenter && !isCenterCard) {
        // Card just became centered
        setIsCenterCard(true);
        autoplayTimer.current = setTimeout(() => {
          if (isCenterCard) {
            setShowVideo(true);
          }
        }, 1000);
      } else if (!isCenter && isCenterCard) {
        // Card just left center
        setIsCenterCard(false);
        if (autoplayTimer.current) {
          clearTimeout(autoplayTimer.current);
        }
        setShowVideo(false);
      }
    };

    const scrollHandler = () => {
      checkIfCenter();
    };

    window.addEventListener('scroll', scrollHandler);
    return () => {
      window.removeEventListener('scroll', scrollHandler);
      if (autoplayTimer.current) {
        clearTimeout(autoplayTimer.current);
      }
    };
  }, [isCenterCard]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
      if (autoplayTimer.current) {
        clearTimeout(autoplayTimer.current);
      }
    };
  }, []);

  const handleClick = () => {
    addToCart(game);
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 1000);
  };

  const handlePlatformClick = (e: React.MouseEvent, platform: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowFilters(true);
    setFilters({ platform });
  };

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
    const themeSuffix = darkMode ? '' : '_black';
    return `/assets/icons/${baseName}${themeSuffix}.png`;
  };

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-transform hover:scale-105 group"
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isEligible && (
        <Link to={`/flash-sale?platform=${game.Platform}`} className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            <Zap size={12} className="mr-1" />
            Flash Sale
          </span>
        </Link>
      )}

      <Link to={`/game/${game.id}`}>
        <div className="relative w-full pt-[56.25%]">
          {showVideo && videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1${isCenterCard ? '' : '&mute=1'}`}
              className="absolute inset-0 w-full h-full"
              style={{ aspectRatio: '16/9' }}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
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
        </div>
      </Link>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {game.Game_Title}
        </h3>
        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${game.Price_to_Sell_For}
          </span>
          <button
            onClick={handleClick}
            className={`p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors ${
              isClicked ? 'bg-green-600 cursor-not-allowed' : ''
            }`}
            disabled={isClicked}
          >
            {isClicked ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};