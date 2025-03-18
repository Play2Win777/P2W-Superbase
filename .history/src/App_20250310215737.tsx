// App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Gamepad as GameBit, Search } from 'lucide-react';
import { fetchGames } from './api';
import { useStore } from './store';
import { Filters } from './components/Filters';
import { GameCard } from './components/GameCard';
import { Cart } from './components/Cart';
import { GameDetails } from './pages/GameDetails';
import { Checkout } from './pages/Checkout';
import { FlashSalePage } from './pages/FlashSalePage';
import { DiscountPopup } from './components/DiscountPopup';
import { ThemeContext } from './context/ThemeContext'; // Import ThemeContext

// SEARCH BAR COMPONENT
const SearchBar = () => {
    const {
        games,
        searchGames,
        setFilteredGames,
        setCurrentPage
    } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (searchGames) {
            searchGames(term);
        } else {
            if (!term.trim()) {
                setFilteredGames(games);
            } else {
                const results = games.filter(game =>
                    game.Game_Title.toLowerCase().includes(term.toLowerCase())
                );
                setFilteredGames(results);
            }
        }

        // Reset to first page when searching
        setCurrentPage(1);

        // If user is not on the home page and they've typed at least 2 characters, navigate to home
        if (location.pathname !== '/' && term.length >= 2) {
            navigate('/');
        }
    };

    return (
        <input
            type="text"
            placeholder="Search Games..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-3 py-2 border rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
    );
};


// FOOTER COMPONENT
const Footer = ({ toggleDarkMode, darkMode }) => {
    return (
        <footer className="bg-white dark:bg-gray-800 shadow-md mt-8 py-4 overflow-visible">
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Dark Mode Toggle on the left */}
                <button
                    onClick={toggleDarkMode}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg whitespace-nowrap"
                >
                    {darkMode ? (
                        <span>Light Mode</span>
                    ) : (
                        <span>Dark Mode</span>
                    )}
                </button>


                {/* Add DiscountPopup button to the footer */}
                <div className="ml-4">
                    <DiscountPopup />
                </div>
            </div>
        </footer>
    );
};


function App() {
    const {
        games,
        filteredGames,
        currentPage,
        setGames,
        setFilteredGames,
        setCurrentPage,
    } = useStore();

    const [darkMode, setDarkMode] = useState(true);
    const [showFilters, setShowFilters] = useState(false);


    useEffect(() => {
        const loadGames = async () => {
            const fetchedGames = await fetchGames();
            const randomizedGames = [...fetchedGames].sort(() => Math.random() - 0.5);
            setGames(randomizedGames);
            setFilteredGames(randomizedGames);
        };


        loadGames();
    }, [setGames, setFilteredGames]);


    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);


    const toggleDarkMode = () => {
        setDarkMode((prev) => !prev);
    };


    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };


    const gamesPerPage = 12;
    const paginatedGames = filteredGames.slice(0, currentPage * gamesPerPage);
    const hasMore = paginatedGames.length < filteredGames.length;


    const themeValue = {
        darkMode,
        toggleDarkMode: () => setDarkMode(prev => !prev)
    };


    // Storylane function
    const playStorylane = () => {
        if (typeof Storylane !== 'undefined') {
            Storylane.Play({ type: 'popup', demo_type: 'image', width: 1920, height: 959, scale: '0.95', demo_url: 'https://app.storylane.io/demo/gc4nsbbb2ugi?embed=popup', padding_bottom: 'calc(49.95% + 25px)' });
        } else {
            console.error("Storylane is not defined. Ensure the script is loaded.");
        }
    };


    return (
        <ThemeContext.Provider value={themeValue}>
            <Router>
                <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <header className="bg-white dark:bg-gray-800 shadow-sm">
                        {/* Load Storylane script here */}
                        <script async src="https://js.storylane.io/js/v2/storylane.js"></script>
                        <div className="container mx-auto px-4 py-1">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h1
                                        onClick={() => window.location.href = '/'}
                                        className="text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap cursor-pointer flex items-center"
                                    >
                                        <img src="/assets/icons/p2wlogo.png" alt="Play 2 Win" className="h-16 mr-3" /> {/* Adjust size as needed */}
                                    </h1>
                                </div>


                                {/* Split the search input and button */}
                                <div className="flex items-center w-1/2 md:w-auto">
                                    <div className="mr-2 flex-grow">
                                        <SearchBar />
                                    </div>
                                    {/* Original filter toggle button */}
                                    <button
                                        onClick={toggleFilters}
                                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                                    >
                                        <Search className="h-5 w-5" />
                                    </button>
                                </div>

                                <Cart className="hidden md:block" />
                            </div>
                        </div>
                        {/* Storylane Embed Button */}
                        <div style={{ textAlign: 'center', paddingBottom: '10px' }}>
                            <button
                                onClick={playStorylane}
                                className="sl-preview-cta"
                                style={{
                                    backgroundColor: '#9939EB',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0px 0px 15px rgba(26, 19, 72, 0.45)',
                                    color: '#FFFFFF',
                                    display: 'inline-block',
                                    fontFamily: 'Poppins, Arial, sans-serif',
                                    fontSize: 'clamp(16px, 1.599vw, 20px)',
                                    fontWeight: '600',
                                    height: 'clamp(40px, 3.996vw, 50px)',
                                    lineHeight: '1.2',
                                    padding: '0 clamp(15px, 1.776vw, 20px)',
                                    textOverflow: 'ellipsis',
                                    transform: 'translateZ(0)',
                                    transition: 'background 0.4s',
                                    whiteSpace: 'nowrap',
                                    width: 'auto',
                                    zIndex: 999999,
                                    cursor: 'pointer'
                                }}
                            >
                                Click to learn how to use this website
                            </button>
                        </div>
                    </header>


                    <Routes>
                        <Route
                            path="/"
                            element={
                                <main className="container mx-auto px-4 py-4">
                                    {showFilters && (
                                        <div className="mb-6">
                                            <Filters />
                                        </div>
                                    )}


                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-0">
                                        {paginatedGames.map((game) => (
                                            <GameCard key={game.id} game={game} />
                                        ))}
                                    </div>
                                    {hasMore && (
                                        <div className="mt-8 text-center">
                                            <button
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                                            >
                                                Load More Games
                                            </button>
                                        </div>
                                    )}
                                </main>
                            }
                        />
                        <Route path="/game/:id" element={<GameDetails />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/flash-sale" element={<FlashSalePage />} />
                    </Routes>


                    {/* Footer with Dark Mode Toggle and DiscountPopup */}
                    <Footer toggleDarkMode={themeValue.toggleDarkMode} darkMode={darkMode} />
                </div>
            </Router>
        </ThemeContext.Provider>
    );
}

export default App;
