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
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout>();
  const touchTimer = useRef<NodeJS.Timeout>();
  const videoDelayTimer = useRef<NodeJS.Timeout>();
  const addToCart = useStore((state) => state.addToCart);
  const { darkMode } = useTheme();
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const { setFilters, setShowFilters } = useStore((state) => ({
    setFilters: state.setFilters,
    setShowFilters: state.setShowFilters,
  }));
  const videoRef = useRef<HTMLIFrameElement>(null);

  const isEligible = isFlashSaleEligible(game);
  const videoId = game.Youtube_link?.split('v=')[1]?.split('&')[0];

  // Fetch exchange rate (USD to SRD)
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const usdToSrd = data.rates.SRD || 36.35; // Fallback to 36.35 if API fails
        setExchangeRate(usdToSrd + 0.4); // Add 40 cents markup
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        setExchangeRate(36.35 + 0.4); // Fallback to 36.35 + 0.4 if API fails
      }
    };

    fetchExchangeRate();
  }, []);

  // Round price to the nearest whole number
  const roundedPrice = Math.round(game.Price_to_Sell_For);

  // Calculate SRD price and round to the nearest 5 SRD
  const srdPrice = exchangeRate
    ? Math.round((game.Price_to_Sell_For * exchangeRate) / 5) * 5
    : null;

  // Intersection Observer Logic
  useEffect(() => {
    if (window.innerWidth > 768) return; // Only for mobile

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('Card is intersecting, showing video after 1 second');
            videoDelayTimer.current = setTimeout(() => {
              setShowVideo(true);
            }, 1000); // 1-second delay
          } else {
            console.log('Card is not intersecting, hiding video');
            if (videoDelayTimer.current) {
              clearTimeout(videoDelayTimer.current);
            }
            setShowVideo(false);
          }
        });
      },
      {
        threshold: 0.94, // Trigger when 94% of the card is visible
        rootMargin: '-23% 0px -23% 0px', // Shrink the intersection area
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth > 768 || hasVideoError) return;

    const target = e.target as HTMLElement;
    if (target.closest('button, a')) return;

    setIsLoadingVideo(true);
    touchTimer.current = setTimeout(() => {
      setShowVideo(true);
      setIsLoadingVideo(false);
    }, 1000);
  };

  const handleTouchEnd = () => {
    if (window.innerWidth > 768) return;

    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
    }
    setIsLoadingVideo(false);
  };

  const handleTouchCancel = () => {
    setShowVideo(false);
    setIsLoadingVideo(false);
    if (touchTimer.current) clearTimeout(touchTimer.current);
  };

  // Desktop hover handlers
  const handleMouseEnter = () => {
    if (window.innerWidth > 768 && !hasVideoError) {
      hoverTimer.current = setTimeout(() => {
        setShowVideo(true);
      }, 2000);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    if (window.innerWidth > 768) {
      setShowVideo(false);
    }
  };

  // Platform icon mapping
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
    setTimeout(() => setIsClicked(false), 1000);
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onTouchMove={handleTouchCancel}
      ref={cardRef}
    >
      {isEligible && (
        <Link to={`/flash-sale?platform=${game.Platform}`} className="absolute top-2 left-2 z-20">
          <span className="inline-flex items-center bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            <Zap size={12} className="mr-1" />
            Flash Sale
          </span>
        </Link>
      )}

      {/* Platform button (positioned 2 points from the left and centered vertically) */}
      <div
        className="gamecard-icon-container cursor-pointer hover:opacity-80 transition-opacity z-20 absolute top-1/2 left-2 transform -translate-y-1/2"
        onClick={(e) => handlePlatformClick(e, game.Platform)}
      >
        <img
          src={getPlatformIcon(game.Platform)}
          alt={game.Platform}
          className="h-6 w-auto rounded"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>

      <Link to={`/game/${game.id}`}>
        <div className="relative w-full pt-[56.25%]">
          {isLoadingVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {showVideo && videoId && !hasVideoError ? (
            <div className="absolute inset-0 w-full h-full">
              <iframe
                ref={videoRef}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&enablejsapi=1&modestbranding=1&loop=1`}
                className="absolute inset-0 w-full h-full"
                style={{ aspectRatio: '16/9' }}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => console.log('YouTube video loaded successfully')}
                onError={() => {
                  console.error('YouTube video failed to load');
                  setHasVideoError(true);
                  setShowVideo(false);
                }}
              />
            </div>
          ) : (
            <img
              src={game.image_url_medium}
              alt={game.Game_Title}
              className="absolute inset-0 w-full h-full object-contain bg-gray-100 dark:bg-gray-700"
              loading="lazy"
              onError={() => setHasVideoError(true)}
            />
          )}

          {/* Fade-out overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent dark:from-black/20 dark:via-black/0 ${showVideo ? 'fade-out' : ''}`}>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-2 items-center ml-2"> {/* Moved 2 points from the left edge */}
                  <span className="px-0.5 py-0.25 bg-blue-500/80 rounded text-sm">
                    {`${game.Genre}${game.Sub_Genre ? ` - ${game.Sub_Genre}` : ''}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2"> {/* Moved 2 points from the left edge */}
                <span className="text-amber-400 font-bold">★</span>
                <span className="font-semibold">Metacritic: {game.Metacritic_Score}/100</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart button with rounded price and SRD price */}
      <button
        onClick={handleClick}
        className={`absolute top-2 right-2 p-1.5 bg-emerald-500 text-white rounded-md shadow-lg hover:bg-emerald-600 transition-colors z-20 ${
          isClicked ? 'bg-green-600 cursor-not-allowed' : ''
        }`}
        disabled={isClicked}
      >
        <div className="flex flex-col items-center gap-0">
          <div className="flex items-center gap-0">
            <span className="font-semibold">${roundedPrice}</span>
            {isClicked ? <Check size={20} /> : <ShoppingCart size={20} className="group-hover:neon-wiggle" />}
          </div>
          {srdPrice && (
            <span className="text-xs text-white lowercase">srd {srdPrice}</span>
          )}
        </div>
      </button>
    </div>
  );
};