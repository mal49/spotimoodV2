import React from 'react';

export default function Modal({children, onClose}){
    return(
        <div 
        className='fixed inset-0 bg-dark-bg bg-opacity-75 flex items-center justify-center z-50 p-4'
        onClick={onClose}
        >
            <div
            className='bg-dark-card rounded-lg p-8 shadow-2xl max-w-lg w-full relative'
            onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}