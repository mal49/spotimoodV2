import React from 'react'

export default function Button({children, onClick, className='', disabled=false}){
    return(
        <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md font-bold transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${className}`}
        disabled={disabled}
        >
            {children}
        </button>
    );
}