// pages/IntroSalePage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Zap, Loader, ShoppingCart, Check, Info } from 'lucide-react';
import { useStore } from '../store';
import { isIntroSaleEligible } from '../utils/gameHelpers';

export const IntroSalePage: React.FC = () => {
  const { games, fetchGames, addToCart } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [clickedGames, setClickedGames] = useState<Set<string>>(new Set());
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadGames = async () => {
      setIsLoading(true);
      await fetchGames();
      setIsLoading(false);
    };

    loadGames();
  }, [fetchGames]);

  // Filter games to only include Intro Sale eligible games (Xbox One)
  const introSaleGames = games.filter(game => isIntroSaleEligible(game));

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
          <Zap size={28} className="mr-2 text-blue-500" />
          Intro Sale Games
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Build your Xbox One collection and enjoy up to 55% off during this intro sale!
        </p>
      </div>

      {/* Intro Sale Details Section */}
      <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Info size={24} className="text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            About the Intro Sale
          </h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Thank you for checking out our collection! We hope you start your own collection with us. 
          All Xbox One games currently enjoy exclusive discounts of up to 55%.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Discount Tiers</h3>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li>1 game - 5% off</li>
              <li>2 games - 10% off</li>
              <li>3 games - 15% off</li>
              <li>4 games - 20% off</li>
              <li>5 games - 25% off</li>
              <li>6 games - 30% off</li>
              <li>7 games - 35% off</li>
              <li>8 games - 40% off</li>
              <li>9 games - 45% off</li>
              <li>10 games - 50% off</li>
              <li>11 games - 55% off <span role="img" aria-label="heart">❤️</span></li>
              <li>Check your cart <ShoppingCart size={20} text-green-500" /> to see your discount</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Stewardship</h3>
            <p className="text-gray-700 dark:text-gray-300">
              I started this collection because I believe that the technology of the Xbox One and PS4 era is good enough to create 'Timeless' games. 
              If DVDs and peripherals are well-maintained, these games can become collector's items that you can still enjoy with your children in 10 years.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Our Mission</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            During this sale, 50% of the profits will be used to create game bundles (preferably an Xbox One, 2 controllers, and 7 games) for children's homes. 
            The goal is to install these bundles before the summer vacation of 2025. For more information, feel free to send us a message via WhatsApp during the checkout process.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            If you'd like to contribute more to this project before the summer vacation starts, please let us know via WhatsApp. 
            Together, we can create multiple Xbox One bundles for children's homes.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size={40} className="animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {introSaleGames.map(game => (
            <div key={game.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden flex flex-col h-full">
              <div className="relative flex-grow">
                <div className="absolute top-2 left-2 z-10">
                  <span className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-700 text-white px-2 py-1 rounded-md text-xs font-semibold">
                    <Zap size={12} className="mr-1" />
                    Intro Sale
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
      )}
    </div>
  );
};

export default IntroSalePage;