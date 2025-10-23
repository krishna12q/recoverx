import type { DailyLog } from '../types';

const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const isYesterday = (today: Date, yesterday: Date): boolean => {
    const prevDay = new Date(today);
    prevDay.setDate(today.getDate() - 1);
    return isSameDay(prevDay, yesterday);
};

export const calculateCurrentStreak = (logs: DailyLog[]): number => {
    if (!logs || logs.length === 0) {
        return 0;
    }

    const sortedLogs = [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const today = new Date();
    const latestLogDate = new Date(sortedLogs[0].createdAt);

    if (!isSameDay(today, latestLogDate) && !isYesterday(today, latestLogDate)) {
        return 0; // Streak is broken if the last log wasn't today or yesterday
    }
    
    let streak = 1;
    let lastLogDate = latestLogDate;

    for (let i = 1; i < sortedLogs.length; i++) {
        const currentLogDate = new Date(sortedLogs[i].createdAt);
        if (isYesterday(lastLogDate, currentLogDate)) {
            streak++;
            lastLogDate = currentLogDate;
        } else if (!isSameDay(lastLogDate, currentLogDate)) {
            // Gap in days, streak is broken
            break;
        }
        // If it's the same day, we just ignore it and continue checking from that date
    }

    return streak;
};
