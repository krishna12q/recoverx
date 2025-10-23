import type { User, DailyLog } from '../types';

// WARNING: This service simulates a real API but uses localStorage as a mock database.

const MOCK_DB_LOGS_KEY = 'recoverx_logs_db';

// --- Mock Database Functions ---

const getMockDbLogs = (): DailyLog[] => {
    try {
        const logs = localStorage.getItem(MOCK_DB_LOGS_KEY);
        return logs ? JSON.parse(logs) : [];
    } catch (e) {
        return [];
    }
};

const saveMockDbLogs = (logs: DailyLog[]) => {
    localStorage.setItem(MOCK_DB_LOGS_KEY, JSON.stringify(logs));
};


// --- API-like Service Functions ---

/**
 * Simulates a GET request to `/api/tracking` for a specific user.
 */
export const getLogsForUser = (user: User): Promise<DailyLog[]> => {
    console.log("Simulating API call to: GET /api/tracking for user:", user.id);
    return new Promise((resolve) => {
        setTimeout(() => { // Simulate network delay
            const allLogs = getMockDbLogs();
            const userLogs = allLogs
                .filter(log => log.userId === user.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            resolve(userLogs);
        }, 300);
    });
};

/**
 * FOR ADMIN USE ONLY
 * Simulates a GET request to `/api/admin/tracking`.
 */
export const getAllLogsForAdmin = (): Promise<DailyLog[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getMockDbLogs());
        }, 100);
    });
};


/**
 * Simulates a POST request to `/api/tracking`.
 */
export const addLog = (logData: Omit<DailyLog, 'id' | 'userId' | 'createdAt'>, user: User): Promise<DailyLog> => {
    console.log("Simulating API call to: POST /api/tracking for user:", user.id);
    return new Promise((resolve) => {
        setTimeout(() => {
            const allLogs = getMockDbLogs();
            const newLog: DailyLog = {
                ...logData,
                id: crypto.randomUUID(),
                userId: user.id,
                createdAt: new Date().toISOString(),
            };
            allLogs.push(newLog);
            saveMockDbLogs(allLogs);
            resolve(newLog);
        }, 300);
    });
};