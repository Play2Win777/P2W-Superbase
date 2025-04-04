import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { ArrowLeft, ShoppingCart, Sparkles, Check } from 'lucide-react';
import { useStore } from '../store'; // Ensure this import is correct
import { Zap } from 'lucide-react';
import { FlashSaleBadge } from '../components/FlashSaleBadge';
import { isFlashSaleEligible } from '../utils/gameHelpers';
import { useTheme } from '../context/ThemeContext'; // Ensure this import is correct
import { getGameCoverUrl, getGameCoverFallbackUrl } from '../utils/imageUtils';

// Game Bundle Component
const GameBundles: React.FC<{ currentGame: any }> = ({ currentGame }) => {
  const { games, addToCart } = useStore();

  // Find games by same developer or genre while excluding the current game
  const relatedGames = games.filter(game => 
    (game.Developer === currentGame.Developer || 
    game.Genre === currentGame.Genre) && 
    game.id !== currentGame.id
  ).slice(0, 3);

  if (relatedGames.length < 2) return null;

  const bundleDiscount = 15;
  const bundleItems = [...relatedGames, currentGame];
  const originalPrice = bundleItems.reduce((sum, game) => sum + (game.Price_to_Sell_For || 0), 0);
  const bundlePrice = originalPrice * (1 - bundleDiscount/100);
  const savings = originalPrice - bundlePrice;

  const handleAddBundle = () => {
    // Add all games in bundle to cart with isBundleItem: true
    relatedGames.forEach((game) =>
      addToCart({ ...game, isBundleItem: true }) // Mark as bundle item
    );
    addToCart({ ...currentGame, isBundleItem: true }); // Mark as bundle item
  };

  return (
    <div className="mt-8 border border-purple-200 dark:border-purple-900 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        Bundle & Save {bundleDiscount}%
      </h3>
      <div className="flex flex-wrap gap-4">
        {relatedGames.map(game => (
          <div key={game.id} className="flex items-center gap-2">
            <picture>
              <source srcSet={getGameCoverUrl(game.id)} type="image/webp" />
              <img
                src={getGameCoverFallbackUrl(game.id)}
                alt={game.Game_Title}
                className="w-20 h-20 object-contain rounded"
              />
            </picture>
            <span className="text-gray-900 dark:text-white">{game.Game_Title}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">${bundlePrice.toFixed(2)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Save ${savings.toFixed(2)}</p>
        </div>
        <button 
          onClick={handleAddBundle}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
          Add Bundle to Cart
        </button>
      </div>
    </div>
  );
};

export const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { games, addToCart, fetchGames } = useStore();
  const { darkMode } = useTheme();
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();
  const { setFilters, setShowFilters } = useStore((state) => ({
    setFilters: state.setFilters,
    setShowFilters: state.setShowFilters,
  }));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const game = games.find((g) => g.id === id);
  const isEligible = game ? isFlashSaleEligible(game) : false;

  // Fallback if game is not found
  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Link
          to="/"
          className="inline-flex items-center text-purple-500 hover:text-purple-600 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Games
        </Link>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Game Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The game you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const videoId = game.Youtube_link?.split('v=')[1];

  const suggestions = games.filter(
    (g) =>
      g.id !== game.id &&
      g.Platform === game.Platform &&
      g.Genre === game.Genre
  );

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

    // 1. Navigates to the home page
    navigate('/');

    // 2. Scrolls to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 3. Opens the filters section
    setShowFilters(true);

    // 4. Sets the platform filter
    setFilters({ platform });
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Link
        to="/"
        className="inline-flex items-center text-purple-500 hover:text-purple-600 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Games
      </Link>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Main Content */}
        <div className="col-span-12 md:col-span-8">
          <div className="relative mb-6">
            {/* Add flash sale badge if eligible */}
            {isEligible && <FlashSaleBadge className="absolute top-4 left-4 z-10" />}
            {videoId ? (
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}`}
                  className="w-full h-full rounded-lg"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
                <button
                  onClick={handleClick}
                  className={`absolute bottom-2 right-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center neon-border neon-pulse ${
                    isClicked ? 'bg-green-600 cursor-not-allowed' : ''
                  }`}
                  disabled={isClicked}
                >
                  {isClicked ? <Check size={20} className="mr-2" /> : <ShoppingCart size={20} className="mr-2" />}
                  ${game.Price_to_Sell_For}
                </button>
              </div>
            ) : (
              <div className="relative">
              <picture>
                <source srcSet={getGameCoverUrl(game.id)} type="image/webp" />
                <img
                  src={getGameCoverFallbackUrl(game.id)}
                  alt={game.Game_Title}
                  className="w-full rounded-lg"
                />
              </picture>
                <button
                  onClick={handleClick}
                  className={`absolute bottom-2 right-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center neon-border neon-pulse ${
                    isClicked ? 'bg-green-600 cursor-not-allowed' : ''
                  }`}
                  disabled={isClicked}
                >
                  {isClicked ? <Check size={20} className="mr-2" /> : <ShoppingCart size={20} className="mr-2" />}
                  ${game.Price_to_Sell_For}
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {game.Game_Title}
            </h1>
            {/* Flash sale indicator - made clickable to go to Flash Sale page */}
            {isEligible && (
              <Link to={`/flash-sale?platform=${game.Platform}`} className="inline-flex items-center mb-4 bg-gradient-to-r from-red-600 to-orange-500 text-white px-3 py-1 rounded-md hover:from-red-700 hover:to-orange-600 transition-colors animate-pulse">
                <Zap size={16} className="mr-1" />
                <span>Flash Sale</span>
              </Link>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Metacritic
                </h3>
                <div className="text-2xl font-bold text-purple-500">
                  {game.Metacritic_Score}/100
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  User Score
                </h3>
                <div className="text-2xl font-bold text-purple-500">
                  {game.User_Score}/10
                </div>
              </div>
            </div>
          </div>

          {/* Add Bundle Component Here */}
          <GameBundles currentGame={game} />
        </div>

        {/* Right Column - Additional Info */}
        <div className="col-span-12 md:col-span-4">
          <div className="flex flex-wrap gap-2 mb-6">
            {/* Clickable Platform Icon */}
            <div 
              className="gamecard-icon-container cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => handlePlatformClick(e, game.Platform)}
            >
              <img
                src={getPlatformIcon(game.Platform)}
                alt={game.Platform}
                className="h-6 w-auto rounded"
              />
            </div>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full">
              {game.Genre}
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full">
              {game.Age_Rating}
            </span>
          </div>

          <div className="prose max-w-none dark:prose-dark mb-6">
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {game.Short_Description}
            </p>

            <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {game.Key_Features}
            </p>

            <h2 className="text-2xl font-semibold mb-4">Unique Selling Point</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {game.Unique_Selling_Point}
            </p>
          </div>

          <div className="prose max-w-none dark:prose-dark">
            <h3 className="font-semibold mb-2">Additional Info</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 dark:text-gray-400">
                  Developer:
                </span>{" "}
                {game.Developer}
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-400">
                  Release Year:
                </span>{" "}
                {game.Release_Year}
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-400">
                  Max Offline Players:
                </span>{" "}
                {game.Max_Offline_Players}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {suggestions.map((suggestion) => {
              const isSuggestionEligible = isFlashSaleEligible(suggestion);
              return (
                <Link
                  key={suggestion.id}
                  to={`/game/${suggestion.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4 flex flex-col items-center overflow-hidden relative"
                >
                  {/* Add flash sale badge if eligible */}
                  {isSuggestionEligible && <FlashSaleBadge className="absolute top-2 left-2 z-10" />}
                  <div className="aspect-w-1 aspect-h-1 w-full">
                  <picture>
                    <source srcSet={getGameCoverUrl(suggestion.id)} type="image/webp" />
                      <img
                      src={getGameCoverFallbackUrl(suggestion.id)}
                      alt={suggestion.Game_Title}
                      className="object-cover rounded-md"
                    />
                  </picture>
                  </div>
                  <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white">
                    {suggestion.Game_Title}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetails;