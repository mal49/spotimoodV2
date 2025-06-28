import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn, Music, Stars, Sparkles, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import React, { useState, useRef, useEffect } from 'react';

export default function LandingPage({onGetStarted}){
    const navigate = useNavigate();
    const { user, profile, isAuthenticated, loading: authLoading, signOut } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);

    // Get user's display name for personalized greeting
    const getUserDisplayName = () => {
        if (!isAuthenticated) return null;
        
        return profile?.display_name || 
               profile?.full_name || 
               user?.user_metadata?.display_name || 
               user?.user_metadata?.full_name ||
               user?.email?.split('@')[0] || 
               'there';
    };

    const handleGetStarted = () => {
        if (isAuthenticated) {
            // If user is authenticated, go directly to the main app
            navigate('/');
        } else {
            // If not authenticated, redirect to auth page for proper onboarding
            navigate('/auth');
        }
    };

    const handleContinueToDashboard = () => {
        // For authenticated users, go to the main app
        navigate('/');
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            setShowUserMenu(false);
            // Stay on landing page after sign out - no navigation needed
            // AppContext will automatically handle the auth state change
        } catch (error) {
            console.error('Error signing out:', error);
        }
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

    return(
        <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden'>
            {/* Background decorative elements */}
            <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none'>
                <div className='absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse'></div>
                <div className='absolute top-40 right-20 w-24 h-24 bg-pink-200 rounded-full opacity-30 animate-bounce delay-1000'></div>
                <div className='absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200 rounded-full opacity-15 animate-pulse delay-500'></div>
            </div>

            {/* Navigation */}
            <nav className='relative z-20 w-full flex justify-between items-center p-6 lg:px-12'>
                <div className='flex items-center space-x-2'>
                    <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg'></div>
                    <span className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                        spotimood
                    </span>
                </div>
                
                {/* Navigation items */}
                <div className='flex items-center space-x-8'>
                    <div className='hidden md:flex space-x-8'>
                        <a href="#" className='text-gray-700 font-medium hover:text-purple-600 transition-colors duration-300 relative group'>
                            Home
                            <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full'></span>
                        </a>
                        <a href="#" className='text-gray-700 font-medium hover:text-purple-600 transition-colors duration-300 relative group'>
                            About
                            <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full'></span>
                        </a>
                        <a href="#" className='text-gray-700 font-medium hover:text-purple-600 transition-colors duration-300 relative group'>
                            Service
                            <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full'></span>
                        </a>
                        <a href="#" className='text-gray-700 font-medium hover:text-purple-600 transition-colors duration-300 relative group'>
                            Contact
                            <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full'></span>
                        </a>
                    </div>

                    {/* User status indicator */}
                    {authLoading ? (
                        <div className="flex items-center space-x-2 text-gray-500">
                            <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                    ) : isAuthenticated ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className='flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-purple-100 hover:bg-white/80 transition-colors group'
                            >
                                <User className='w-4 h-4 text-purple-600' />
                                <span className='text-sm font-medium text-purple-700'>
                                    {getUserDisplayName()}
                                </span>
                                <ChevronDown className={`w-3 h-3 text-purple-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-purple-100 z-50">
                                    {/* User Info Section */}
                                    <div className="px-4 py-3 border-b border-purple-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-800 font-medium truncate text-sm">
                                                    {getUserDisplayName()}
                                                </p>
                                                <p className="text-gray-500 text-xs truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <button
                                            onClick={handleContinueToDashboard}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-colors text-sm"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                            <span>Go to Dashboard</span>
                                        </button>
                                        
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-sm"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </nav>

            {/* Main Content */}
            <div className='relative z-10 flex-grow flex items-center justify-center min-h-[calc(100vh-100px)] px-6 lg:px-12'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto'>
                    {/* Text Content */}
                    <div className='space-y-8 text-center lg:text-left'>
                        <div className='space-y-6'>
                            <div className='inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full'>
                                <span className='text-purple-700 font-medium text-sm flex items-center gap-2'>
                            <Music className='w-4 h-4' />
                            {isAuthenticated ? 'Welcome back to your musical journey' : 'Discover Your Musical Mood'}
                        </span>
                            </div>
                            
                            <h1 className='text-5xl lg:text-7xl font-bold leading-tight'>
                                {isAuthenticated && (
                                    <div className='text-lg lg:text-xl font-normal text-gray-600 mb-2'>
                                        Hello, {getUserDisplayName()}! 👋
                                    </div>
                                )}
                                <span className='bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent'>
                                    Spotimood
                                </span>
                            </h1>
                            
                            <p className='text-gray-600 text-lg lg:text-xl leading-relaxed max-w-2xl'>
                                {isAuthenticated ? (
                                    "Ready to dive back into your personalized musical experience? Your mood history and playlists are waiting for you."
                                ) : (
                                    "Transform your emotions into the perfect soundtrack. Spotimood creates personalized playlists that match your mood, helping you explore and enhance your emotional wellbeing through music."
                                )}
                            </p>
                        </div>

                        {/* Feature highlights */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center lg:text-left'>
                            <div className='p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-100'>
                                <div className='text-purple-500 text-2xl mb-2'>🎭</div>
                                <p className='text-sm font-medium text-gray-700'>
                                    {isAuthenticated ? 'Your Mood History' : 'Mood Analysis'}
                                </p>
                            </div>
                            <div className='p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-100'>
                                <div className='text-pink-500 text-2xl mb-2'>
                                    <Music className='w-8 h-8' />
                                </div>
                                <p className='text-sm font-medium text-gray-700'>
                                    {isAuthenticated ? 'Saved Playlists' : 'Smart Playlists'}
                                </p>
                            </div>
                            <div className='p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-100'>
                                <div className='text-indigo-500 text-2xl mb-2'>📊</div>
                                <p className='text-sm font-medium text-gray-700'>
                                    {isAuthenticated ? 'Personalized Insights' : 'Mood Tracking'}
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                            {isAuthenticated ? (
                                <button 
                                    onClick={handleContinueToDashboard} 
                                    className='group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:from-purple-700 hover:to-pink-700'
                                >
                                    <span className='flex items-center justify-center space-x-2'>
                                        <span>Continue to Dashboard</span>
                                        <ArrowRight className='w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300' />
                                    </span>
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={handleGetStarted} 
                                        className='group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:from-purple-700 hover:to-pink-700'
                                    >
                                        <span className='flex items-center justify-center space-x-2'>
                                            <span>Get Started</span>
                                            <ArrowRight className='w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300' />
                                        </span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => navigate('/auth')} 
                                        className='group bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg border-2 border-purple-200 hover:border-purple-400 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-purple-50'
                                    >
                                        <span className='flex items-center justify-center space-x-2'>
                                            <span>Sign In</span>
                                            <LogIn className='w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300' />
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Additional info for authenticated users */}
                        {isAuthenticated && (
                            <div className='bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100'>
                                <p className='text-sm text-purple-700'>
                                    🎉 <strong>Welcome back!</strong> Your personal music journey continues with saved playlists, mood history, and personalized recommendations.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Image/Logo Section */}
                    <div className='flex justify-center lg:justify-end'>
                        <div className='relative'>
                            {/* Decorative background */}
                            <div className='absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl transform scale-110'></div>
                            
                            {/* Main image container */}
                            <div className='relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50'>
                                <img 
                                    src="spotimood-logo.jpeg" 
                                    alt="spotimood logo" 
                                    className="w-80 h-80 object-cover rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-500" 
                                />
                                
                                {/* Floating elements */}
                                <div className='absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-bounce'>
                                    <Music className='w-6 h-6 text-purple-300' />
                                </div>
                                <div className='absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse'>
                                    <Sparkles className='w-6 h-6 text-yellow-300' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom wave decoration */}
            <div className='absolute bottom-0 left-0 w-full overflow-hidden leading-none'>
                <svg className='relative block w-full h-20' data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-purple-100 opacity-50"></path>
                </svg>
            </div>
        </div>
    );
}