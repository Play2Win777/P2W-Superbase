import React from 'react';
import { useStore } from '../store';
import { Search, Filter } from 'lucide-react';

export const Filters: React.FC = () => {
  const {
    games,
    filters,
    searchQuery,
    setSearchQuery,
    setFilters,
    setFilteredGames,
  } = useStore();

  const platforms = Array.from(
    new Set(games.map((game) => game.Platform))
  );
  const genres = Array.from(new Set(games.map((game) => game.Genre)));
  const subGenres = Array.from(
    new Set(games.map((game) => game.Sub_Genre))
  );
  const gameModes = Array.from(
    new Set(
      games.flatMap((game) =>
        Array.isArray(game.Game_Modes) ? game.Game_Modes : []
      )
    )
  );

  const applyFilters = () => {
    let filtered = [...games];

    if (searchQuery) {
      filtered = filtered.filter((game) =>
        game.Game_Title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.platform) {
      filtered = filtered.filter((game) => game.Platform === filters.platform);
    }

    if (filters.genre) {
      filtered = filtered.filter((game) => game.Genre === filters.genre);
    }

    if (filters.subGenre) {
      filtered = filtered.filter((game) => game.Sub_Genre === filters.subGenre);
    }

    if (filters.gameModes.length > 0) {
      filtered = filtered.filter((game) =>
        filters.gameModes.some((mode) => game.Game_Modes?.includes(mode))
      );
    }

    filtered = filtered.filter(
      (game) =>
        game.Price_to_Sell_For >= filters.priceRange.min &&
        game.Price_to_Sell_For <= filters.priceRange.max
    );

    setFilteredGames(filtered);
  };

  React.useEffect(() => {
    applyFilters();
  }, [searchQuery, filters]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
      {/* Added dark mode support for the container */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            // Added dark mode support for the search input
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={20}
            // Added dark mode support for the search icon
          />
        </div>
        <Filter className="text-purple-500" size={24} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <select
          value={filters.platform}
          onChange={(e) => setFilters({ platform: e.target.value })}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          // Added dark mode support for the platform select
        >
          <option value="">All Platforms</option>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        <select
          value={filters.genre}
          onChange={(e) => setFilters({ genre: e.target.value })}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          // Added dark mode support for the genre select
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <select
          value={filters.subGenre}
          onChange={(e) => setFilters({ subGenre: e.target.value })}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          // Added dark mode support for the sub-genre select
        >
          <option value="">All Sub-Genres</option>
          {subGenres.map((subGenre) => (
            <option key={subGenre} value={subGenre}>
              {subGenre}
            </option>
          ))}
        </select>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price Range</label>
          {/* Added dark mode support for the price range label */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.priceRange.min}
              onChange={(e) =>
                setFilters({
                  priceRange: { ...filters.priceRange, min: +e.target.value },
                })
              }
              className="w-24 border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Min"
              // Added dark mode support for the min price input
            />
            <span className="text-gray-600 dark:text-gray-400">-</span>
            {/* Added dark mode support for the dash */}
            <input
              type="number"
              value={filters.priceRange.max}
              onChange={(e) =>
                setFilters({
                  priceRange: { ...filters.priceRange, max: +e.target.value },
                })
              }
              className="w-24 border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Max"
              // Added dark mode support for the max price input
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Game Modes</label>
        {/* Added dark mode support for the game modes label */}
        <div className="flex flex-wrap gap-2">
          {gameModes.map((mode) => (
            <label key={mode} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.gameModes.includes(mode)}
                onChange={(e) => {
                  const newModes = e.target.checked
                    ? [...filters.gameModes, mode]
                    : filters.gameModes.filter((m) => m !== mode);
                  setFilters({ gameModes: newModes });
                }}
                className="rounded text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-900 dark:text-white">{mode}</span>
              {/* Added dark mode support for the game modes text */}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};