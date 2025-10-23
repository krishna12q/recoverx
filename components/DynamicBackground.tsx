import React from 'react';

const DynamicBackground: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden" aria-hidden="true">
            {/* Dark background */}
            <div className="absolute top-0 left-0 w-full h-full bg-brand-dark"></div>
            {/* Subtle gradient overlay for depth */}
            <div 
                className="absolute top-0 left-0 w-full h-full"
                style={{
                    backgroundImage: 'radial-gradient(circle at center, rgba(13, 11, 20, 0.8) 0%, var(--color-brand-dark) 70%)',
                }}
            ></div>
        </div>
    );
};

export default DynamicBackground;