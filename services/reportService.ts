import type { InjuryReport, RecoveryPlan, User } from '../types';

// WARNING: This service simulates a real API but uses localStorage as a mock database.

const MOCK_DB_REPORTS_KEY = 'recoverx_reports_db';

// --- Mock Database Functions ---

const getMockDbReports = (): InjuryReport[] => {
    try {
        const reports = localStorage.getItem(MOCK_DB_REPORTS_KEY);
        return reports ? JSON.parse(reports) : [];
    } catch (e) {
        return [];
    }
};

const saveMockDbReports = (reports: InjuryReport[]) => {
    localStorage.setItem(MOCK_DB_REPORTS_KEY, JSON.stringify(reports));
};

// --- API-like Service Functions ---

/**
 * Simulates a GET request to `/api/reports`.
 * The authenticated user context is now passed in directly.
 */
export const getReportsForUser = (user: User): Promise<InjuryReport[]> => {
    console.log("Simulating API call to: GET /api/reports for user:", user.id);
    return new Promise((resolve) => {
        setTimeout(() => { // Simulate network delay
            const allReports = getMockDbReports();
            const userReports = allReports
                .filter(report => report.userId === user.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            resolve(userReports);
        }, 300);
    });
};

/**
 * FOR ADMIN USE ONLY
 * Simulates a GET request to `/api/admin/reports`.
 */
export const getAllReportsForAdmin = (): Promise<InjuryReport[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getMockDbReports());
        }, 100);
    });
};

/**
 * Simulates a POST request to `/api/reports`.
 */
export const addReport = (plan: RecoveryPlan, userDescription: string, user: User): Promise<InjuryReport> => {
     console.log("Simulating API call to: POST /api/reports for user:", user.id);
    return new Promise((resolve) => {
        setTimeout(() => {
            const allReports = getMockDbReports();
            const newReport: InjuryReport = {
                id: crypto.randomUUID(),
                userId: user.id,
                createdAt: new Date().toISOString(),
                userDescription,
                plan,
            };
            allReports.unshift(newReport);
            saveMockDbReports(allReports);
            resolve(newReport);
        }, 300);
    });
};

/**
 * Simulates a DELETE request to `/api/reports/:reportId`.
 */
export const deleteReport = (reportId: string, user: User): Promise<void> => {
    console.log(`Simulating API call to: DELETE /api/reports/${reportId} for user:`, user.id);
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            let allReports = getMockDbReports();
            const initialLength = allReports.length;
            // Ensure the report belongs to the user trying to delete it
            const reportToDelete = allReports.find(report => report.id === reportId);

            if (reportToDelete && reportToDelete.userId === user.id) {
                 allReports = allReports.filter(report => report.id !== reportId);
                 saveMockDbReports(allReports);
                 resolve();
            } else if (!reportToDelete) {
                reject(new Error("Report not found."));
            }
            else {
                reject(new Error("User does not have permission to delete this report."));
            }
        }, 300);
    });
};