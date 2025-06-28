import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePlaylist } from '../../context/PlaylistContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Home, Search, Library, Crown, MessageCircle, Plus, User, LogOut } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { playlists, fetchPlaylists } = usePlaylist();
    const { user, profile, isAuthenticated, signOut } = useAuth();

    useEffect(() => {
        fetchPlaylists();
    }, [location.pathname, fetchPlaylists]); // Refetch when navigating

    const NavLink = ({ icon, text, to }) => (
        <Link 
            to={to}
            className={`flex items-center space-x-4 p-3 rounded-md w-full text-left transition-colors ${
                location.pathname === to ? 'text-text-light bg-dark-card' : 'text-text-medium hover:text-text-light hover:bg-dark-card'
            }`}
        >
            {icon}
            <span className='font-bold'>{text}</span>
        </Link>
    );

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

    const handleSignOut = async () => {
        try {
            await signOut();
            // Navigate to root, AppContext will handle showing landing page
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    
    return(
        <div className='w-64 bg-black p-4 flex flex-col space-y-4 h-full'>
            <nav className='space-y-2'>
                <NavLink icon={<Home className='w-6 h-6' />} text="Home" to="/" />
                <NavLink icon={<Search className='w-6 h-6' />} text="Search" to="/search" />
                <NavLink icon={<Library className='w-6 h-6' />} text="Your Library" to="/library" />
                <NavLink icon={<Crown className='w-6 h-6' />} text="Premium" to="/subscription" />
            </nav>

            <div className='border-t border-dark-card pt-4 mt-4'>
                <NavLink icon={<MessageCircle className='w-6 h-6' />} text="Feedback" to="/feedback" />
            </div>

            <div className='border-t border-dark-card pt-4 mt-4 flex-1'>
                <h3 className='text-sm text-text-medium mb-2 uppercase tracking-wider'>Playlists</h3>
                <Link 
                    to="/playlists"
                    className='flex items-center space-x-2 text-text-medium hover:text-text-light p-3 rounded-md w-full text-left transition-colors'
                > 
                    <Plus className='w-6 h-6' />
                    <span className='font-bold'>Create Playlist</span>
                </Link>

                <ul className='mt-2 space-y-1 text-sm text-text-medium overflow-y-auto max-h-48'>
                    {playlists.map((playlist) => (
                        <li key={playlist.id}>
                            <Link 
                                to={`/playlist/${playlist.id}`}
                                className='hover:text-text-light p-2 rounded-md w-full text-left transition-colors'
                            >
                                {playlist.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* User Section - Only show when authenticated */}
            {isAuthenticated && (
                <div className='border-t border-dark-card pt-4 mt-4'>
                    <div className='bg-dark-card rounded-lg p-3'>
                        {/* User Info */}
                        <div className='flex items-center space-x-3 mb-3'>
                            <div className='w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center'>
                                <User className='w-4 h-4 text-white' />
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-text-light font-medium text-sm truncate'>
                                    {getUserDisplayName()}
                                </p>
                                <p className='text-text-medium text-xs truncate'>
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        
                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOut}
                            className='w-full flex items-center space-x-2 text-red-400 hover:text-red-300 p-2 rounded-md hover:bg-dark-hover transition-colors text-sm'
                        >
                            <LogOut className='w-4 h-4' />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}