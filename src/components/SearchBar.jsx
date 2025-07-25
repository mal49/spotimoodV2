import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext.jsx';
import { Search, X } from 'lucide-react';

export default function SearchBar() {
    const { query, setQuery } = useSearch();
    const navigate = useNavigate();
    const searchInputRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const [showShortcutHint, setShowShortcutHint] = useState(false);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        setShowShortcutHint(false);
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (!query) {
            setTimeout(() => setShowShortcutHint(true), 1000);
        }
    };

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Track Ctrl key state
            if (e.key === 'Control') {
                setIsCtrlPressed(true);
            }
            
            // Handle Ctrl+K shortcut
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                
                // Add search pulse animation
                const searchContainer = searchInputRef.current?.parentElement;
                if (searchContainer) {
                    searchContainer.classList.add('search-pulse');
                    setTimeout(() => {
                        searchContainer.classList.remove('search-pulse');
                    }, 600);
                }
            }

            // Handle Escape to blur
            if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                searchInputRef.current.blur();
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === 'Control') {
                setIsCtrlPressed(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // Show shortcut hint initially (only on desktop)
        const timer = setTimeout(() => {
            if (window.innerWidth >= 768) {
                setShowShortcutHint(true);
            }
        }, 2000);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="relative">
                <div className={`relative transition-all duration-300 ${
                    isFocused 
                        ? 'transform scale-105 shadow-lg shadow-purple-500/20' 
                        : 'transform scale-100'
                }`}>
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="Search songs, artists, albums..."
                        className={`w-full bg-dark-card text-white px-3 py-2.5 sm:px-4 sm:py-3 rounded-full pl-10 sm:pl-12 pr-16 sm:pr-20 transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                            isFocused 
                                ? 'ring-2 ring-purple-500 bg-dark-hover shadow-lg' 
                                : 'ring-1 ring-dark-hover hover:ring-purple-500/50'
                        }`}
                    />
                    
                    {/* Search Icon */}
                    <div className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                        isFocused ? 'text-purple-400 scale-110' : 'text-gray-400'
                    }`}>
                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Keyboard Shortcut Indicator - Hidden on mobile */}
                    <div className={`hidden md:block absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                        isFocused ? 'opacity-0 scale-90' : 'opacity-70 hover:opacity-100'
                    } ${showShortcutHint ? 'animate-pulse' : ''}`}>
                        <div className="flex items-center space-x-1 bg-dark-bg/80 px-2 py-1 rounded-md border border-gray-600">
                            <kbd className={`text-xs font-semibold transition-colors duration-300 ${
                                isCtrlPressed ? 'text-purple-400' : 'text-gray-400'
                            }`}>
                                {navigator.platform.indexOf('Mac') > -1 ? '⌘' : 'Ctrl'}
                            </kbd>
                            <span className="text-gray-500 text-xs">+</span>
                            <kbd className="text-xs font-semibold text-gray-400">K</kbd>
                        </div>
                    </div>

                    {/* Clear Button */}
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-3 sm:right-16 md:right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 opacity-0 animate-fade-in p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Loading/Search Animation */}
                {isFocused && query && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin opacity-50"></div>
                    </div>
                )}
            </form>

            {/* Search Suggestions Placeholder */}
            {isFocused && query && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-dark-card border border-dark-hover rounded-lg shadow-xl z-50 opacity-0 animate-fade-in-up">
                    <div className="p-3 text-gray-400 text-sm">
                        Press Enter to search for "{query}"
                    </div>
                </div>
            )}
        </div>
    );
} 