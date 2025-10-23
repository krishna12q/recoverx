import { themes } from "./App";

export interface User {
    id: string;
    username: string;
    passwordHash?: string;
    bio?: string;
    primaryInjury?: string;
    privacySettings?: {
        anonymousDataSharing: boolean;
    };
    role?: 'admin' | 'user';
    createdAt: string;
    avatarId?: string;
}

export interface Exercise {
    name: string;
    description: string;
    sets: string;
    reps: string;
    frequency: string;
}

export interface RecoveryPlan {
    injury: string;
    summary: string;
    disclaimer: string;
    estimatedRecoveryTime: string;
    otcSuggestions?: string[];
    phases: {
        phase_name: string;
        duration: string;
        goals: string[];
        exercises: Exercise[];
    }[];
}

export interface InjuryReport {
    id: string;
    userId: string;
    createdAt: string;
    userDescription: string;
    plan: RecoveryPlan;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface SavedChat {
    id: string;
    userId: string;
    createdAt: string;
    title: string;
    messages: ChatMessage[];
}

export interface DailyLog {
    id: string;
    userId: string;
    createdAt: string;
    painLevel: number;
    sleepQuality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    injuryFeeling: 'Worse' | 'Same' | 'Better';
    hydration: 'Low' | 'Adequate' | 'High';
    notes: string;
}

export interface UserStats {
    xp: number;
    level: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface Theme {
    id: string;
    name: string;
    colors: Record<string, string>;
}