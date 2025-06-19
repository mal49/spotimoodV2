import React, { useEffect } from 'react';

export default function Modal({children, onClose}){
    // Prevent background scrolling when modal is open
    useEffect(() => {
        // Save the original overflow style
        const originalOverflow = document.body.style.overflow;
        
        // Disable scrolling on the body
        document.body.style.overflow = 'hidden';
        
        // Cleanup function to restore original overflow when component unmounts
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    return(
        <div 
            className='fixed inset-0 bg-dark-bg bg-opacity-75 flex items-start justify-center z-50 p-4 overflow-y-auto'
            onClick={onClose}
        >
            <div
                className='bg-dark-card rounded-lg p-6 shadow-2xl max-w-2xl w-full relative my-8 max-h-[calc(100vh-4rem)] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}