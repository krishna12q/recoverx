import React from 'react';

interface StreakDisplayProps {
    streak: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak }) => {
    const hasStreak = streak > 0;

    return (
        <div className={`w-full p-6 bg-white/5 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 text-center transition-all duration-300 ${hasStreak ? 'border-amber-400/50' : 'border-white/10'}`}>
            <div className={`relative inline-block text-6xl mb-2 ${hasStreak ? 'animate-slow-pulse' : ''}`}>
                🔥
                {hasStreak && <div className="absolute -top-1 -right-2 text-2xl font-bold bg-amber-500 text-white rounded-full h-10 w-10 flex items-center justify-center border-2 border-brand-secondary-dark">{streak}</div>}
            </div>
            <h3 className="text-xl font-bold text-white">
                {hasStreak ? `${streak}-Day Streak!` : "Start Your Streak"}
            </h3>
            <p className="text-gray-400 mt-1">
                {hasStreak ? "Keep up the great work! Log your progress again tomorrow." : "Log your progress today to begin a new streak."}
            </p>
        </div>
    );
};

export default StreakDisplay;
