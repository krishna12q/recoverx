import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="py-8">
            <div className="container mx-auto text-center flex flex-col items-center">
                 <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-brand-light">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
                    </span>
                    Powered by Gemini AI
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                    AI-Powered Recovery
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-gray-400">
                    Effortlessly generate potential recovery plans for sports injuries with our intelligent assistant.
                </p>
            </div>
        </header>
    );
};

export default Header;