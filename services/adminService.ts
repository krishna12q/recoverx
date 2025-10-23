import type { User } from '../types';
import { getAllUsersForAdmin } from './authService';
import { getAllReportsForAdmin } from './reportService';
import { getAllLogsForAdmin } from './trackingService';
import { getAllChatsForAdmin } from './chatService';

export interface AdminDashboardStats {
    totalUsers: number;
    totalReports: number;
    totalLogs: number;
    totalChats: number;
    allUsers: User[];
}

export const getDashboardStats = async (): Promise<AdminDashboardStats> => {
    const [allUsers, allReports, allLogs, allChats] = await Promise.all([
        getAllUsersForAdmin(),
        getAllReportsForAdmin(),
        getAllLogsForAdmin(),
        getAllChatsForAdmin(),
    ]);

    // We subtract 1 from totalUsers to not count the admin account in the public stats
    return {
        totalUsers: allUsers.length -1,
        totalReports: allReports.length,
        totalLogs: allLogs.length,
        totalChats: allChats.length,
        allUsers: allUsers.filter(u => u.role !== 'admin'),
    };
};

export interface ChartData {
    label: string;
    value: number;
}

export const getSignupDataForChart = (allUsers: User[]): ChartData[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = allUsers.filter(user => user.role !== 'admin' && new Date(user.createdAt) > thirtyDaysAgo);

    const signupsByDay: { [key: string]: number } = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        signupsByDay[key] = 0;
    }

    recentUsers.forEach(user => {
        const key = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if(signupsByDay[key] !== undefined) {
             signupsByDay[key]++;
        }
    });
    
    return Object.entries(signupsByDay).map(([label, value]) => ({ label, value }));
};


// This is a simulation since we don't have real payment data
export const getRevenueDataForChart = (allUsers: User[]): ChartData[] => {
    // Pricing: Smart Recovery: 199/mo, Coach: 399/mo
    const smartPrice = 199;
    const coachPrice = 399;

    // Assumption: 10% of users convert to Smart, 2% to Coach
    const smartConversionRate = 0.10;
    const coachConversionRate = 0.02;

    const revenueByMonth: { [key: string]: number } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
        revenueByMonth[key] = 0;
    }
    
    // Filter out admin and calculate revenue based on signup month
    allUsers.filter(u => u.role !== 'admin').forEach(user => {
        const signupDate = new Date(user.createdAt);
        const key = signupDate.toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
        
        if (revenueByMonth[key] !== undefined) {
            // Randomly assign a subscription tier based on conversion rates
            const rand = Math.random();
            if (rand < coachConversionRate) {
                revenueByMonth[key] += coachPrice;
            } else if (rand < coachConversionRate + smartConversionRate) {
                revenueByMonth[key] += smartPrice;
            }
        }
    });

    return Object.entries(revenueByMonth).map(([label, value]) => ({ label, value: Math.round(value) }));
};
