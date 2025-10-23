import type { User, Badge } from '../types';
import { getLogsForUser } from './trackingService';
import { getReportsForUser } from './reportService';
import { calculateCurrentStreak } from './streaksService';
import { showToast } from '../hooks/useToast';

const MOCK_DB_UNLOCKED_BADGES_KEY = 'recoverx_unlocked_badges_db';

export const ALL_BADGES: Badge[] = [
    { id: 'log_1', name: 'First Step', description: 'Logged your progress for the first time.', icon: '📝' },
    { id: 'report_1', name: 'The Planner', description: 'Generated your first recovery plan.', icon: '🗺️' },
    { id: 'streak_3', name: 'On a Roll', description: 'Maintained a 3-day logging streak.', icon: '🔥' },
    { id: 'streak_7', name: 'Week Warrior', description: 'Maintained a 7-day logging streak.', icon: '🏆' },
];

// --- Local Storage Functions ---

const getUnlockedBadgesFromStorage = (user: User): Record<string, string[]> => {
    try {
        const store = localStorage.getItem(MOCK_DB_UNLOCKED_BADGES_KEY);
        return store ? JSON.parse(store) : {};
    } catch {
        return {};
    }
};

const saveUnlockedBadgesToStorage = (user: User, badgeIds: string[]) => {
    const store = getUnlockedBadgesFromStorage(user);
    store[user.id] = badgeIds;
    localStorage.setItem(MOCK_DB_UNLOCKED_BADGES_KEY, JSON.stringify(store));
};

// --- API-like Service Functions ---

export const getUnlockedBadgeIds = (user: User): Promise<string[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const store = getUnlockedBadgesFromStorage(user);
            resolve(store[user.id] || []);
        }, 100);
    });
};

export const checkAndAwardNewBadges = async (user: User): Promise<void> => {
    try {
        // 1. Fetch all necessary data
        const [logs, reports, previouslyAwardedIds] = await Promise.all([
            getLogsForUser(user),
            getReportsForUser(user),
            getUnlockedBadgeIds(user)
        ]);
        const streak = calculateCurrentStreak(logs);

        // 2. Determine all currently earned badges
        const earnedBadgeIds = new Set<string>();

        if (logs.length > 0) earnedBadgeIds.add('log_1');
        if (reports.length > 0) earnedBadgeIds.add('report_1');
        if (streak >= 3) earnedBadgeIds.add('streak_3');
        if (streak >= 7) earnedBadgeIds.add('streak_7');

        // 3. Find the new ones
        const newBadgeIds = [...earnedBadgeIds].filter(id => !previouslyAwardedIds.includes(id));

        // 4. Save and notify
        if (newBadgeIds.length > 0) {
            const allEarnedIds = [...earnedBadgeIds];
            saveUnlockedBadgesToStorage(user, allEarnedIds);

            // Give user a toast notification for each new badge
            newBadgeIds.forEach(id => {
                const badge = ALL_BADGES.find(b => b.id === id);
                if (badge) {
                    showToast(`Badge Unlocked: ${badge.name} ${badge.icon}`, 'success');
                }
            });
        }
    } catch (error) {
        console.error("Failed to check and award badges:", error);
    }
};