import React, {useState} from 'react';
import SongRow from '../songRow.jsx';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Heart, MoreHorizontal, Shuffle } from 'lucide-react';
import config from '../../lib/config.js';

export default function PlaylistPage({playlistData, onBack}){
    const defaultPlaylistTitle = "MY FAVORITE HITS";
    const defaultPlaylistDescription = "A mix of all your best tunes. By user • 10 songs, 38 min";
    const defaultSong = [
        { id: 1, title: 'Song Title One', artist: 'Artist A', album: 'Album X', duration: '3:45' },
        { id: 2, title: 'Another Tune', artist: 'Artist B', album: 'Album Y', duration: '4:10' },
        { id: 3, title: 'Track Three', artist: 'Artist C', album: 'Album Z', duration: '2:55' },
        { id: 4, title: 'Melody Four', artist: 'Artist D', album: 'Album W', duration: '3:20' },
        { id: 5, title: 'The Fifth Song', artist: 'Artist E', album: 'Album V', duration: '4:50' },
        { id: 6, title: 'Sixth Symphony', artist: 'Artist F', album: 'Album U', duration: '3:00' },
        { id: 7, title: 'Seventh Heaven', artist: 'Artist G', album: 'Album T', duration: '3:30' },
        { id: 8, title: 'Eighth Wonder', artist: 'Artist H', album: 'Album S', duration: '4:00' },
        { id: 9, title: 'Ninth Note', artist: 'Artist I', album: 'Album R', duration: '3:15' },
        { id: 10, title: 'Tenth Tune', artist: 'Artist J', album: 'Album Q', duration: '3:55' },
    ];

    const currentPlaylist = playlistData || {
        title: defaultPlaylistTitle,
        description: defaultPlaylistDescription,
        songs: defaultSong,
    };

    const [playlistDescription, setPlaylistDescription] = useState(currentPlaylist.description);
    const [isLoadingDescription, setIsLoadingDescription] = useState(false);
    const [descriptionError, setDescriptionError] = useState(null);

    const { setQueue, setCurrentIndex, setPlaying } = usePlayer();

    React.useEffect(() => {
        if (playlistData) {
            setPlaylistDescription(playlistData.description);
        } else {
            setPlaylistDescription(defaultPlaylistDescription);
        }
    }, [playlistData, defaultPlaylistDescription]);

    const generatedPlaylistDescription = async () => {
        setIsLoadingDescription(true);
        setDescriptionError(null);
        try {
            const prompt = `Generate a short, creative, and appealing description for a music playlist titled ${currentPlaylist.title}. The description should be about 15-20 words and capture its essence.`;
            let chatHistory = [];
            chatHistory.push({role: 'user', parts: [{text: prompt }] });
            const payload = {contents: chatHistory};

            const response = await fetch(`${config.API_BASE_URL}/api/generate-mood-playlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
            }

            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            const songCount = currentPlaylist.songs ? currentPlaylist.songs.length : 0;
            const totalDuration = currentPlaylist.songs ? "38 min" : "N/A";
            setPlaylistDescription(text + ` By user • ${songCount} songs, ${totalDuration}`);
        } catch (error) {
            console.error("Error generating playlist description:", error);
            setDescriptionError(`Failed to generate description: ${error.message}`);
            setPlaylistDescription("Failed to load description. Please try again");
        } finally {
            setIsLoadingDescription(false);
        }
    };
    
    const handlePlayAll = () => {
        if (!currentPlaylist.songs?.length) return;
        
        // Set the entire playlist as the queue
        currentPlaylist.songs.forEach(song => {
            setQueue({
                id: song.id,
                title: song.title,
                artist: song.artist,
                thumbnail: song.thumbnail
            });
        });
        
        // Start playing from the first song
        setCurrentIndex(0);
        setPlaying(true);
    };

    const handlePlaySong = (song, index) => {
        // Set the queue starting from the selected song
        currentPlaylist.songs.slice(index).forEach(s => {
            setQueue({
                id: s.id,
                title: s.title,
                artist: s.artist,
                thumbnail: s.thumbnail
            });
        });
        
        // Start playing from the first song in the new queue
        setCurrentIndex(0);
        setPlaying(true);
    };

    return(
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold text-white">{currentPlaylist.title}</h1>
            </div>

            <div className="mb-8">
                <p className="text-gray-400">{playlistDescription}</p>
            </div>

            <div className="flex items-center space-x-4 mb-8">
                <button 
                    onClick={handlePlayAll}
                    className="bg-primary-purple text-black px-6 py-3 rounded-full font-bold text-lg flex items-center space-x-2 hover:scale-105 transition-transform"
                >
                    <Play className="w-6 h-6" fill="currentColor" />
                    <span>Play All</span>
                </button>
                <button className='bg-primary-purple text-black px-6 py-3 rounded-full font-bold text-lg flex items-center space-x-2 hover:scale-105 transition-colors'>
                        <Shuffle className='w-6 h-6' />
                        <span>Shuffle</span>
                </button>
                <button className='text-text-medium hover:text-primary-purple transition-colors'>
                        <Heart className='w-8 h-8' />
                </button>
                <button className='text-text-medium hover:text-text-light transition-colors'>
                        <MoreHorizontal className='w-8 h-8' />
                </button>
            </div>

            <div className='bg-dark-card rounded-lg p-4'>
                <div className='grid grid-cols-[auto,3fr,2fr,2fr,1fr] gap-4 text-text-medium text-sm font-semibold border-b border-dark-hover pb-2 mb-2'>
                    <div>#</div>
                    <div>TITLE</div>
                    <div>ARTIST</div>
                    <div>ALBUM</div>
                    <div className='text-right'>DURATION</div>
                </div>
                {currentPlaylist.songs.map((song, index) => (
                    <div
                        key={song.id}
                        onClick={() => handlePlaySong(song, index)}
                        className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                        <div className="w-12 h-12 mr-4">
                            <img
                                src={song.thumbnail}
                                alt={song.title}
                                className="w-full h-full object-cover rounded"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-medium">{song.title}</h3>
                            <p className="text-gray-400 text-sm">{song.artist}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}