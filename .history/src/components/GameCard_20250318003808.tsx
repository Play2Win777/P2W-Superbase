import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Check } from 'lucide-react';
import { Game } from '../types';
import { useStore } from '../store';
import { isFlashSaleEligible } from '../utils/gameHelpers';
import { useTheme } from '../context/ThemeContext';
import { Toast } from './Toast';

interface GameCardProps {
  game: Game;
  index: number; // Add index prop to identify each card
}

export const GameCard: React.FC<GameCardProps> = ({ game, index }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [isCenter, setIsCenter] = useState(false);
  const [autoplayWithSound, setAutoplayWithSound] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout>();
  const centerCheckTimer = useRef<NodeJS.Timeout>();
  const addToCart = useStore((state) => state.addToCart);
  const { darkMode } = useTheme();
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const { setFilters, setShowFilters } = useStore((state) => ({
    setFilters: state.setFilters,
    setShowFilters: state.setShowFilters,
  }));
  const toastMessage = useStore((state) => state.toastMessage);
  const toastDiscountInfo = useStore((state) => state.toastDiscountInfo);

  // Check if game is eligible for flash sale
  const isEligible = isFlashSaleEligible(game);

  const videoId = game.Youtube_link?.split('v=')[1]?.split('&')[0];

  // Function to determine if this card is the most centered in the viewport
  const checkIfCentered = () => {
    if (!cardRef.current) return false;
    
    const rect = cardRef.current.getBoundingClientRect();
    const windowCenter = window.innerWidth / 2;
    const cardCenter = rect.left + rect.width / 2;
    const distance = Math.abs(windowCenter - cardCenter);
    
    // Check if at least 80% of the card is visible
    const isVisible = 
      rect.top < window.innerHeight && 
      rect.bottom > 0 && 
      rect.left < window.innerWidth && 
      rect.right > 0;
    
    // Get all game cards
    const allCards = document.querySelectorAll('[data-game-card="true"]');
    let isClosestToCenter = true;
    
    // Check if this card is the closest to center
    allCards.forEach((card) => {
      if (card !== cardRef.current) {
        const otherRect = card.getBoundingClientRect();
        const otherCenter = otherRect.left + otherRect.width / 2;
        const otherDistance = Math.abs(windowCenter - otherCenter);
        
        if (otherDistance < distance) {
          isClosestToCenter = false;
        }
      }
    });
    
    return isVisible && isClosestToCenter;
  };

  useEffect(() => {
    const handleScroll = () => {
      const centered = checkIfCentered();
      if (centered !== isCenter) {
        setIsCenter(centered);
        
        // If this card became the center card, start the autoplay timer
        if (centered && videoId) {
          clearTimeout(centerCheckTimer.current);
          centerCheckTimer.current = setTimeout(() => {
            setShowVideo(true);
            setAutoplayWithSound(true);
          }, 1000);
        } else {
          // If no longer centered, stop video and clear timer
          clearTimeout(centerCheckTimer.current);
          if (autoplayWithSound) {
            setShowVideo(false);
            setAutoplayWithSound(false);
          }
        }
      }
    };

    // Initial check
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Check periodically in case of dynamic content loading
    const intervalId = setInterval(handleScroll, 500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearInterval(intervalId);
      clearTimeout(centerCheckTimer.current);
      clearTimeout(hoverTimer.current);
    };
  }, [videoId, isCenter, autoplayWithSound]);

  const handleMouseEnter = () => {
    // Only use hover timer on desktop
    if (window.innerWidth > 768) {
      hoverTimer.current = setTimeout(() => {
        setShowVideo(true);
        // Desktop hover should be muted
        setAutoplayWithSound(false);
      }, 2000);
    }
  };

  const handleMouseLeave = () => {
    // Only respond to mouse events on desktop
    if (window.innerWidth > 768) {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
      // Only turn off video if it wasn't triggered by being centered
      if (!isCenter) {
        setShowVideo(false);
        setAutoplayWithSound(false);
      }
    }
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

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-transform hover:scale-105 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={cardRef}
      data-game-card="true"
      data-game-index={index}
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
            <div className="absolute inset-0 w-full h-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1${autoplayWithSound ? '' : '&mute=1'}`}
                className="absolute inset-0 w-full h-full"
                style={{ aspectRatio: '16/9' }}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
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
                  <div 
                    className="gamecard-icon-container cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => handlePlatformClick(e, game.Platform)}
                  >
                    <img
                      src={getPlatformIcon(game.Platform)}
                      alt={game.Platform}
                      className="h-6 w-auto rounded"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <span className="px-2 py-1 bg-blue-500/80 rounded text-sm">
                    {`${game.Genre}${game.Sub_Genre ? ` - ${game.Sub_Genre}` : ''}`}
                  </span>
                </div>
                <span className="text-2xl font-bold">${game.Price_to_Sell_For}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">★</span>
                <span className="font-semibold">Metacritic: {game.Metacritic_Score}/100</span>
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
      
      {/* Indicator for debugging - remove in production */}
      {/* {isCenter && (
        <div className="absolute top-2 left-24 bg-red-500 text-white px-2 py-1 rounded text-xs">
          Center
        </div>
      )} */}
    </div>
  );
};