import React from 'react';
import HomePage from '../pages/homePage.jsx';
import PlaylistPage from '../pages/playlistPage.jsx'

export default function MainContent( {currentPage, generatedPlaylist, setGeneratedPlaylist, setCurrentPage, userHasStoredMood} ){
    switch(currentPage) {
        case 'home':
            return(
                <HomePage 
                setGeneratedPlaylist={setGeneratedPlaylist}
                setCurrentPage={setCurrentPage}
                userHasStoredMood={userHasStoredMood}
            />
            );
        case 'playlist':
            return <PlaylistPage playlistData={generatedPlaylist}/>;
        default:
            return(
                <div className='text-center text-text-medium mt-20'>
                    <h2 className='text-2xl font-bold'>Content for "{currentPage}"</h2>
                    <p className='mt-2'>This section is under construction. Please select Home or a Playlist</p>
                </div>
            );
    }
}