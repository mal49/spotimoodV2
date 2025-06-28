import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePlaylist } from '../../context/PlaylistContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Home, Search, Library, Crown, MessageCircle, Plus, Music, Sparkles } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();
    const { playlists, fetchPlaylists, isLoading } = usePlaylist();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchPlaylists();
        }
    }, [location.pathname, fetchPlaylists, isAuthenticated]); // Refetch when navigating or auth changes

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

    return(
        <div className='w-64 bg-black p-4 flex flex-col space-y-4 h-full pb-24'>
            <nav className='space-y-2'>
                <NavLink icon={<Home className='w-6 h-6' />} text="Home" to="/" />
                <NavLink icon={<Search className='w-6 h-6' />} text="Search" to="/search" />
                <NavLink icon={<Library className='w-6 h-6' />} text="Your Library" to="/playlists" />
                <NavLink icon={<Crown className='w-6 h-6' />} text="Premium" to="/subscription" />
            </nav>

            <div className='border-t border-dark-card pt-4 mt-4'>
                <NavLink icon={<MessageCircle className='w-6 h-6' />} text="Feedback" to="/feedback" />
            </div>

            <div className='border-t border-dark-card pt-4 mt-4 flex-1 flex flex-col'>
                <div className="flex items-center justify-between mb-2">
                    <h3 className='text-sm text-text-medium uppercase tracking-wider'>Playlists</h3>
                    {isAuthenticated && (
                        <Link 
                            to="/playlists"
                            className='text-text-medium hover:text-text-light transition-colors'
                            title="Create Playlist"
                        > 
                            <Plus className='w-4 h-4' />
                        </Link>
                    )}
                </div>

                {!isAuthenticated ? (
                    <div className="text-center py-4">
                        <p className="text-text-medium text-sm mb-3">Sign in to see your playlists</p>
                        <Link 
                            to="/auth"
                            className="text-primary-purple hover:text-purple-400 text-sm underline"
                        >
                            Sign in
                        </Link>
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-purple"></div>
                        <span className="ml-2 text-text-medium text-sm">Loading...</span>
                    </div>
                ) : playlists.length === 0 ? (
                    <div className="text-center py-4">
                        <Music className="w-8 h-8 text-text-medium mx-auto mb-2 opacity-50" />
                        <p className="text-text-medium text-sm mb-3">No playlists yet</p>
                        <Link 
                            to="/playlists"
                            className="text-primary-purple hover:text-purple-400 text-sm underline"
                        >
                            Create your first playlist
                        </Link>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden">
                        <ul className='space-y-1 text-sm text-text-medium overflow-y-auto max-h-full'>
                            {playlists.map((playlist) => (
                                <li key={playlist.id}>
                                    <Link 
                                        to={`/playlist/${playlist.id}`}
                                        className={`flex items-center space-x-3 hover:text-text-light hover:bg-dark-card p-2 rounded-md w-full text-left transition-colors group ${
                                            location.pathname === `/playlist/${playlist.id}` ? 'text-text-light bg-dark-card' : ''
                                        }`}
                                        title={playlist.name || playlist.title}
                                    >
                                        <div className="flex-shrink-0">
                                            {playlist.mood_based ? (
                                                <Sparkles className="w-4 h-4 text-purple-400" />
                                            ) : (
                                                <Music className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate font-medium">
                                                {playlist.name || playlist.title}
                                            </p>
                                            {playlist.description && (
                                                <p className="text-xs text-text-medium truncate opacity-75">
                                                    {playlist.description}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        
                        {playlists.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-dark-card">
                                <Link 
                                    to="/playlists"
                                    className="flex items-center justify-center space-x-2 text-text-medium hover:text-text-light p-2 rounded-md transition-colors text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Create New Playlist</span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}