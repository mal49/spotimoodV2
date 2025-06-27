import React from 'react';
import { Play } from 'lucide-react';

export default function PlaylistCard({imageUrl, title, description}) {
    return(
        <div className='bg-dark-card rounded-lg p-4 transition-all duration-300 hover:bg-dark-hover group relative cursor-pointer'>
            <img 
            src={imageUrl} 
            alt={title}
            className='w-full h-auto rounded-md shadow-lg mb-4' 
            onError={(e) => {e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/AA60C8/FFFFFF?text=No+Image';}}
            />
            {/* title */}
            <h4 className='font-bold text-text-light text-lg truncate'>{title}</h4>
            {/* description */}
            <p className='text-text-medium text-sm truncate'>{description}</p>

            <button className='absolute bottom-20 right-6 bg-primary-purple text-black p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300'>
                <Play className='w-5 h-5' fill='currentColor' />
            </button>
        </div>
    );   
}