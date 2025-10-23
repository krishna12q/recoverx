import type { User, UserStats } from '../types';

const MOCK_DB_STATS_KEY = 'recoverx_gamification_stats';

// --- Helper Functions ---

const getMockDbStats = (): Record<string, UserStats> => {
    try {
        const stats = localStorage.getItem(MOCK_DB_STATS_KEY);
        return stats ? JSON.parse(stats) : {};
    } catch (e) {
        return {};
    }
};

const saveMockDbStats = (stats: Record<string, UserStats>) => {
    localStorage.setItem(MOCK_DB_STATS_KEY, JSON.stringify(stats));
};

export const getXpForLevel = (level: number): number => {
    if (level <= 1) return 0;
    // Formula for XP required to *reach* a certain level
    return Math.floor(100 * Math.pow(level - 1, 1.5));
};


// --- API-like Service Functions ---

export const getUserStats = (user: User): Promise<UserStats> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allStats = getMockDbStats();
            if (allStats[user.id]) {
                resolve(allStats[user.id]);
            } else {
                // Initialize stats for a new user
                const newStats: UserStats = { xp: 0, level: 1 };
                allStats[user.id] = newStats;
                saveMockDbStats(allStats);
                resolve(newStats);
            }
        }, 100);
    });
};

export const addXp = async (user: User, amount: number): Promise<{ oldStats: UserStats, newStats: UserStats, leveledUp: boolean }> => {
    const oldStats = await getUserStats(user);
    const newXp = oldStats.xp + amount;
    let newLevel = oldStats.level;
    let leveledUp = false;

    // Check for level up
    let xpForNextLevel = getXpForLevel(newLevel + 1);
    while (newXp >= xpForNextLevel) {
        newLevel++;
        leveledUp = true;
        xpForNextLevel = getXpForLevel(newLevel + 1);
    }

    const newStats: UserStats = { xp: newXp, level: newLevel };

    const allStats = getMockDbStats();
    allStats[user.id] = newStats;
    saveMockDbStats(allStats);

    window.dispatchEvent(new CustomEvent('stats-updated'));

    return { oldStats, newStats, leveledUp };
};
