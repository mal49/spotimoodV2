import React, { useState, useRef, useEffect } from 'react';
import SearchBar from '../SearchBar.jsx';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const { user, profile, isAuthenticated, signOut } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Get user's display name
    const getUserDisplayName = () => {
        if (!isAuthenticated) return null;
        
        return profile?.display_name || 
               profile?.full_name || 
               user?.user_metadata?.display_name || 
               user?.user_metadata?.full_name ||
               user?.email?.split('@')[0] || 
               'User';
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
            setShowUserMenu(false);
            // Navigate to root, AppContext will handle showing landing page
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return(
        <div className="flex justify-center items-center mb-6 sticky top-0 bg-dark-bg z-10 py-4 px-4">
            {/* search bar - centered */}
            <div className="w-full max-w-2xl">
                <SearchBar />
            </div>

            {/* user profile - positioned absolutely on the right */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2" ref={menuRef}>
                {isAuthenticated ? (
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 bg-dark-card p-2 rounded-full hover:bg-dark-hover transition-colors group"
                        >
                            <User className="w-6 h-6 text-text-light" />
                            <span className="hidden md:block text-text-light text-sm font-medium max-w-32 truncate">
                                {getUserDisplayName()}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-text-medium transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-dark-card rounded-lg shadow-xl border border-dark-hover z-50">
                                {/* User Info Section */}
                                <div className="px-4 py-3 border-b border-dark-hover">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-primary-purple rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-text-light font-medium truncate">
                                                {getUserDisplayName()}
                                            </p>
                                            <p className="text-text-medium text-xs truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            // TODO: Navigate to profile/settings page
                                            console.log('Navigate to profile settings');
                                        }}
                                        className="w-full flex items-center space-x-3 px-4 py-2 text-text-medium hover:text-text-light hover:bg-dark-hover transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Profile Settings</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-dark-hover transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button 
                        onClick={() => navigate('/auth')}
                        className="bg-primary-purple text-text-light px-4 py-2 rounded-full hover:bg-[#C879E6] transition-colors font-medium"
                    >
                        Sign In
                    </button>
                )}
            </div>
        </div>
    );
}