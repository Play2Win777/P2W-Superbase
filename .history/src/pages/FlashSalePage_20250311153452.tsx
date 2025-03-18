// pages/FlashSalePage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Added useLocation import
import { ArrowLeft, Zap, Loader, ShoppingCart, Check } from 'lucide-react';
import { useStore } from '../store';
import { isFlashSaleEligible } from '../utils/gameHelpers';

export const FlashSalePage: React.FC = () => {
  const { games, fetchGames, addToCart } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [clickedGames, setClickedGames] = useState<Set<string>>(new Set());
  const location = useLocation(); // Get the current location

  // Extract the platform query parameter from the URL
  const queryParams = new URLSearchParams(location.search);
  const platformFilter = queryParams.get('platform');

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadGames = async () => {
      setIsLoading(true);
      await fetchGames();
      setIsLoading(false);
    };

    loadGames();
  }, [fetchGames]);

  // Filter games to only include flash sale eligible games and apply platform filter if present
  const flashSaleGames = games.filter(game => 
    isFlashSaleEligible(game) && 
    (!platformFilter || game.Platform === platformFilter) // Apply platform filter if present
  );

  const handleAddToCart = (game: any) => {
    addToCart(game);
    setClickedGames(prev => {
      const newSet = new Set(prev);
      newSet.add(game.id);
      return newSet;
    });
    setTimeout(() => {
      setClickedGames(prev => {
        const newSet = new Set(prev);
        newSet.delete(game.id);
        return newSet;
      });
    }, 1000); // Reset after 1 second
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900">
      <Link
        to="/"
        className="inline-flex items-center text-purple-500 hover:text-purple-600 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Games
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
          <Zap size={28} className="mr-2 text-orange-500" />
          Flash Sale Games
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Add 3 or more flash sale items to your cart to unlock a 25% discount on these games!
        </p>
        {platformFilter && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Showing games for: <strong>{platformFilter}</strong>
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size={40} className="animate-spin text-purple-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {flashSaleGames.map(game => (
              <div key={game.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden flex flex-col h-full">
                <div className="relative flex-grow">
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      <Zap size={12} className="mr-1" />
                      Flash Sale
                    </span>
                  </div>
                  <Link to={`/game/${game.id}`} className="block h-full">
                    <div className="aspect-square w-full overflow-hidden">
                      <img 
                        src={game.image_url_medium} 
                        alt={game.Game_Title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                </div>
                <div className="p-4">
                  <Link 
                    to={`/game/${game.id}`}
                    className="text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-500 dark:hover:text-purple-400 truncate block"
                  >
                    {game.Game_Title}
                  </Link>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${game.Price_to_Sell_For}
                    </span>
                    <button
                      onClick={() => handleAddToCart(game)}
                      className={`p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors ${clickedGames.has(game.id) ? 'bg-green-600 cursor-not-allowed' : ''}`}
                      disabled={clickedGames.has(game.id)}
                    >
                      {clickedGames.has(game.id) ? <Check size={18} /> : <ShoppingCart size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {flashSaleGames.length === 0 && (
            <div className="text-center text-gray-600 dark:text-gray-400 py-12">
              No flash sale games available for this platform.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlashSalePage;