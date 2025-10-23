import React from 'react';

const Logo: React.FC<{ size?: number }> = ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A78BFA"/>
                <stop offset="100%" stopColor="#7C3AED"/>
            </linearGradient>
        </defs>
        <path d="M6 6L18 18M18 6L6 18" stroke="url(#logoGradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default Logo;