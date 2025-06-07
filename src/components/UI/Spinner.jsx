import React from 'react';

export default function Spinner({ className = 'w-8 h-8 text-primary-purple' }){
    return(
        <div className={`inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125rem] motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`} role='status'>
            <span className='!absolute !-m-px !h-px !overflown-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
                Loading...
            </span>
        </div>
    );
}