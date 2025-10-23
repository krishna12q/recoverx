import React, { useState, useEffect, useCallback, Suspense, lazy, useRef } from 'react';
import type { User, InjuryReport, Theme } from '../types';
import { generateRecoveryPlan } from '../services/geminiService';
import { getReportsForUser, addReport, deleteReport } from '../services/reportService';
import { showToast } from '../hooks/useToast';
import InjuryInputForm from '../components/InjuryInputForm';
import RecoveryPlanDisplay from '../components/RecoveryPlanDisplay';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import InjuryList from '../components/InjuryList';
import Logo from '../components/Logo';
import Avatar from '../components/Avatar';

// Lazy load page components for better performance
const TrackingPage = lazy(() => import('./TrackingPage'));
const ExercisesPage = lazy(() => import('./ExercisesPage'));
const AIAssistantPage = lazy(() => import('./AIAssistantPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));
const PricingPage = lazy(() => import('./PricingPage'));
const AdminPage = lazy(() => import('./AdminPage'));

interface DashboardPageProps {
    user: User;
    onLogout: () => void;
    onUpdateUser: (user: User) => void;
    themes: Theme[];
    activeThemeId: string;
    onThemeChange: (themeId: string) => void;
    allUsers: User[];
    onSwitchAccount: (userId: string) => void;
    onAddAccount: () => void;
}

type View = 'DASHBOARD_MAIN' | 'VIEW_REPORT' | 'TRACKING' | 'EXERCISES' | 'AI_ASSISTANT' | 'PLANS' | 'SETTINGS' | 'ADMIN_PANEL';

const NavIcon: React.FC<{ path: string; }> = ({ path }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout, onUpdateUser, themes, activeThemeId, onThemeChange, allUsers, onSwitchAccount, onAddAccount }) => {
    const [view, setView] = useState<View>('DASHBOARD_MAIN');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentReport, setCurrentReport] = useState<InjuryReport | null>(null);
    const [reports, setReports] = useState<InjuryReport[]>([]);
    const [isReportsLoading, setIsReportsLoading] = useState<boolean>(true);
    const [aiChatContext, setAiChatContext] = useState<InjuryReport | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [retryData, setRetryData] = useState<{ description: string; images: { data: string; mimeType: string }[] | null } | null>(null);
    

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    

    const fetchReports = useCallback(async () => {
        try {
            setIsReportsLoading(true);
            const userReports = await getReportsForUser(user);
            setReports(userReports);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch reports.');
        } finally {
            setIsReportsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (view === 'DASHBOARD_MAIN') {
            fetchReports();
        }
    }, [view, fetchReports]);


    const handleFormSubmit = useCallback(async (description: string, images: { data: string; mimeType: string }[] | null) => {
        setIsLoading(true);
        setError(null);
        setCurrentReport(null);
        setRetryData({ description, images }); // Save data for potential retry
        try {
            const plan = await generateRecoveryPlan(description, images);
            const newReport = await addReport(plan, description, user);
            setCurrentReport(newReport);
            showToast(`New report generated!`, 'info');
            setView('VIEW_REPORT');
            setRetryData(null); // Clear retry data on success
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const handleRetry = useCallback(() => {
        if (retryData) {
            handleFormSubmit(retryData.description, retryData.images);
        }
    }, [retryData, handleFormSubmit]);

    const handleViewReport = useCallback((report: InjuryReport) => {
        setCurrentReport(report);
        setView('VIEW_REPORT');
    }, []);

    const handleDeleteReport = useCallback(async (reportId: string) => {
        try {
            await deleteReport(reportId, user);
            setReports(prevReports => prevReports.filter(r => r.id !== reportId));
        } catch (err: any) {
            setError(err.message || "Failed to delete report.");
        }
    }, [user]);

    const handleBackToDashboard = useCallback(() => {
        setCurrentReport(null);
        setView('DASHBOARD_MAIN');
    }, []);
    
    const handleStartChatAboutInjury = useCallback((report: InjuryReport) => {
        setAiChatContext(report);
        setView('AI_ASSISTANT');
    }, []);

    const handleReprogramReport = useCallback((report: InjuryReport) => {
        handleFormSubmit(report.userDescription, null);
    }, [handleFormSubmit]);
    
    const handleReprogramCurrentReport = useCallback(() => {
        if (currentReport) {
            handleFormSubmit(currentReport.userDescription, null);
        }
    }, [currentReport, handleFormSubmit]);

    const handleStartChatForCurrentReport = useCallback(() => {
        if (currentReport) {
            handleStartChatAboutInjury(currentReport);
        }
    }, [currentReport, handleStartChatAboutInjury]);


    const renderDashboardContent = () => {
        if (view === 'VIEW_REPORT' && currentReport) {
            return <RecoveryPlanDisplay 
                        report={currentReport} 
                        onBack={handleBackToDashboard} 
                        onReprogram={handleReprogramCurrentReport}
                        onStartChat={handleStartChatForCurrentReport}
                    />;
        }

        return (
            <div className="w-full max-w-4xl flex flex-col items-center space-y-8">
                <div className="w-full p-6 bg-brand-secondary-dark/60 rounded-xl border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-2">Analyze a New Injury</h2>
                    <p className="text-gray-400 mb-6">Describe a new injury or get a second opinion on an existing one.</p>
                    <InjuryInputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                </div>
                
                {isLoading && <LoadingSpinner />}
                {error && <ErrorMessage message={error} onRetry={handleRetry} />}

                <div className="w-full pt-8 mt-8 border-t border-white/10">
                     <h2 className="text-2xl font-bold text-white mb-6">Your Report History</h2>
                    {isReportsLoading ? (
                        <div className="flex justify-center"><LoadingSpinner /></div>
                    ) : (
                        <InjuryList 
                            reports={reports} 
                            onViewReport={handleViewReport} 
                            onDeleteReport={handleDeleteReport}
                            onReprogramReport={handleReprogramReport}
                            onStartChat={handleStartChatAboutInjury}
                        />
                    )}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        const loadingFallback = <div className="flex justify-center mt-10"><LoadingSpinner /></div>;
        switch (view) {
            case 'DASHBOARD_MAIN':
            case 'VIEW_REPORT':
                return renderDashboardContent();
            case 'TRACKING':
                return <Suspense fallback={loadingFallback}><TrackingPage user={user} /></Suspense>;
            case 'EXERCISES':
                return <Suspense fallback={loadingFallback}><ExercisesPage /></Suspense>;
            case 'AI_ASSISTANT':
                return <Suspense fallback={loadingFallback}><AIAssistantPage 
                            user={user} 
                            injuryContext={aiChatContext} 
                            onContextConsumed={() => setAiChatContext(null)} 
                        /></Suspense>;
            case 'PLANS':
                return <Suspense fallback={loadingFallback}><PricingPage /></Suspense>;
            case 'SETTINGS':
                return <Suspense fallback={loadingFallback}><SettingsPage 
                    user={user} 
                    onUpdateUser={onUpdateUser} 
                    onLogout={onLogout}
                    themes={themes}
                    activeThemeId={activeThemeId}
                    onThemeChange={onThemeChange}
                /></Suspense>;
            case 'ADMIN_PANEL':
                return user.role === 'admin' ? <Suspense fallback={loadingFallback}><AdminPage /></Suspense> : renderDashboardContent();
            default:
                return renderDashboardContent();
        }
    };

    const navItems: { name: string; view: View; iconPath: string }[] = [
        { name: 'Dashboard', view: 'DASHBOARD_MAIN', iconPath: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { name: 'Tracking', view: 'TRACKING', iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Exercises', view: 'EXERCISES', iconPath: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
        { name: 'AI Assistant', view: 'AI_ASSISTANT', iconPath: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
        { name: 'Plans', view: 'PLANS', iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 6a7.5 7.5 0 100 12 7.5 7.5 0 000-12z' },
        { name: 'Settings', view: 'SETTINGS', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ];
    
    if (user.role === 'admin') {
        navItems.splice(1, 0, { name: 'Admin Panel', view: 'ADMIN_PANEL', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' });
    }

    return (
        <div className="flex w-full h-screen bg-brand-dark overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-brand-secondary-dark/40 backdrop-blur-md border-r border-white/10 flex flex-col">
                {/* Logo */}
                <div className="h-20 flex items-center justify-center px-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                        <Logo />
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-purple-400">
                            RecoverX
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-grow px-4 py-6 space-y-2">
                    {navItems.map(item => {
                        const isActive = view === item.view || (view === 'VIEW_REPORT' && item.view === 'DASHBOARD_MAIN');
                        return (
                            <button
                                key={item.name}
                                onClick={() => setView(item.view)}
                                className={`group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-secondary-dark/50 border-l-4 ${
                                    isActive
                                        ? 'border-brand-accent bg-brand-accent/10 text-white'
                                        : 'border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <NavIcon path={item.iconPath} />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User Menu */}
                <div className="p-4 border-t border-white/10 relative" ref={menuRef}>
                     {isMenuOpen && (
                        <div className="absolute left-4 bottom-20 w-72 bg-brand-secondary-dark rounded-lg shadow-2xl border border-white/10 origin-bottom-left animate-fade-in-up z-50" style={{ animationDuration: '200ms' }}>
                            <div className="px-4 py-3 border-b border-white/10">
                                <p className="text-sm font-semibold text-white truncate">Signed in as {user.username}</p>
                            </div>
                            
                            {allUsers.length > 1 && (
                                <div className="py-2 border-b border-white/10">
                                    <p className="px-4 pb-1 text-xs font-semibold text-gray-400 uppercase">Switch account</p>
                                    {allUsers.filter(u => u.id !== user.id).map(account => (
                                        <button
                                            key={account.id}
                                            onClick={() => {
                                                onSwitchAccount(account.id);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex-shrink-0 items-center justify-center w-8 h-8 bg-brand-secondary-dark ring-2 ring-white/20 rounded-full flex">
                                                <Avatar avatarId={account.avatarId} size={20} />
                                            </div>
                                            <span className="flex-grow truncate">{account.username}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="px-2 py-2">
                                <button
                                    onClick={() => {
                                        onAddAccount();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-md transition-colors"
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add account
                                </button>
                                 <button
                                    onClick={() => {
                                        onLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-md transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="group w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Open user menu"
                        aria-expanded={isMenuOpen}
                    >
                        <div className="flex items-center justify-center w-10 h-10 bg-brand-secondary-dark rounded-full border-2 border-transparent group-hover:border-brand-accent/50 transition-colors">
                            <Avatar avatarId={user.avatarId} size={24} />
                        </div>
                        <div className="flex-grow text-left overflow-hidden">
                             <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                             <p className="text-xs text-gray-400">View Profile</p>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;