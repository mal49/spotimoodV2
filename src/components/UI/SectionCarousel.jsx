import React from 'react';

import AlbumCard from '../cards/AlbumCard.jsx';
import PlaylistCard from '../cards/PlaylistCard.jsx';

export default function SectionCarousel({title, items, type}) {
    return(
        <div className='mb-6 sm:mb-8'>
            <h3 className='text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-text-light px-1'>{title}</h3>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6'>
                {items.map(item => (
                    type === 'album' ? (
                        <AlbumCard 
                            key={item.id} 
                            title={item.title} 
                            artist={item.artist} 
                            imageUrl={item.imageUrl}
                            videoId={item.videoId}
                            query={item.query}
                        />
                    ) : (
                        <PlaylistCard 
                            key={item.id} 
                            title={item.title} 
                            description={item.description} 
                            imageUrl={item.imageUrl}
                            songs={item.songs}
                            query={item.query}
                        />
                    )
                ))}
            </div>
        </div>
    );
}