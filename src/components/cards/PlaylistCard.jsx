import React from 'react';

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
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' clipRule='evenodd'></path>
                </svg>
            </button>
        </div>
    );   
}