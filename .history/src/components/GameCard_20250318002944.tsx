import React, { useState, useRef, useEffect } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import { ShoppingCart, Zap, Check } from 'lucide-react';
  import { Game } from '../types';
  import { useStore } from '../store';
  import { isFlashSaleEligible } from '../utils/gameHelpers';
  import { useTheme } from '../context/ThemeContext';

  interface GameCardProps {
    game: Game;
    focusedVideoId: string | null;
    setFocusedVideoId: (videoId: string | null) => void;
  }

  export const GameCard: React.FC<GameCardProps> = ({ game, focusedVideoId, setFocusedVideoId }) => {
    const [showVideo, setShowVideo] = useState(false);
    const hoverTimer = useRef<NodeJS.Timeout>();
    const addToCart = useStore((state) => state.addToCart);
    const { darkMode } = useTheme();
    const [isClicked, setIsClicked] = useState(false);
    const navigate = useNavigate();
    const cardRef = useRef<HTMLDivElement>(null);
    const { setFilters, setShowFilters } = useStore((state) => ({
      setFilters: state.setFilters,
      setShowFilters: state.setShowFilters,
    }));
    const videoId = game.Youtube_link?.split('v=')[1]?.split('&')[0];

    // Handle video autoplay on mobile with only one playing at a time
    useEffect(() => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (!isMobile) return;

      const handleScroll = () => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const isVisible =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth);

        if (isVisible && (!focusedVideoId || focusedVideoId === videoId)) {
          document.querySelectorAll("iframe").forEach((iframe) => {
            iframe.src = iframe.src; // Pause all videos by resetting src
          });
          setShowVideo(true);
          setFocusedVideoId(videoId);
        } else {
          setShowVideo(false);
          if (focusedVideoId === videoId) {
            setFocusedVideoId(null);
          }
        }
      };

      let scrollTimeout: NodeJS.Timeout;
      const scrollHandler = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 500);
      };

      window.addEventListener("scroll", scrollHandler);
      return () => {
        window.removeEventListener("scroll", scrollHandler);
        clearTimeout(scrollTimeout);
      };
    }, [focusedVideoId, setFocusedVideoId, videoId]);
    return (
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-transform hover:scale-105 group"
        ref={cardRef}
      >
        <Link to={`/game/${game.id}`}>
          <div className="relative w-full pt-[56.25%]">
            {showVideo && videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`}
                className="absolute inset-0 w-full h-full"
                style={{ aspectRatio: '16/9' }}
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
          </div>
        </Link>
      </div>
    );
  };