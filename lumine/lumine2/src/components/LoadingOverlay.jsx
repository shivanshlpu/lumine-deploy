import React from 'react';

const LoadingOverlay = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div id="loadingOverlay" className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-saffron-100 border-t-saffron-600"></div>
            <p className="mt-3 text-sm text-saffron-800 font-medium animate-pulse">Verifying credentials...</p>
        </div>
    );
};

export default LoadingOverlay;
