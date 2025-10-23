import React, { useState, useEffect } from 'react';
import Footer from './components/Footer';
import DynamicBackground from './components/DynamicBackground';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import { getActiveUser, logout, getAllLoggedInUsers, switchActiveUser } from './services/authService';
import type { User } from './types';
import ToastContainer from './components/ToastContainer';
import { showToast } from './hooks/useToast';


// --- THEME DEFINITIONS ---
export const themes = [
    { id: 'default', name: 'Cosmic Lilac', colors: { '--color-brand-dark': '#0D0B14', '--color-brand-secondary-dark': '#1F1C2C', '--color-brand-light': '#F0EFFF', '--color-brand-accent': '#7C3AED', '--color-brand-accent-dark': '#6D28D9' } },
    { id: 'ocean-deep', name: 'Ocean Deep', colors: { '--color-brand-dark': '#0c1427', '--color-brand-secondary-dark': '#18294b', '--color-brand-light': '#e0f7fa', '--color-brand-accent': '#00bcd4', '--color-brand-accent-dark': '#0097a7' } },
    { id: 'sunset-glow', name: 'Sunset Glow', colors: { '--color-brand-dark': '#2c132a', '--color-brand-secondary-dark': '#4a2545', '--color-brand-light': '#ffebcd', '--color-brand-accent': '#ff7043', '--color-brand-accent-dark': '#f4511e' } },
    { id: 'forest-trail', name: 'Forest Trail', colors: { '--color-brand-dark': '#1e2a22', '--color-brand-secondary-dark': '#344e41', '--color-brand-light': '#f0ead2', '--color-brand-accent': '#a3b18a', '--color-brand-accent-dark': '#588157' } },
    { id: 'crimson-night', name: 'Crimson Night', colors: { '--color-brand-dark': '#1a1a1a', '--color-brand-secondary-dark': '#2e0a0a', '--color-brand-light': '#f5f5f5', '--color-brand-accent': '#e53935', '--color-brand-accent-dark': '#c62828' } },
    { id: 'cyberpunk-neon', name: 'Cyberpunk Neon', colors: { '--color-brand-dark': '#000000', '--color-brand-secondary-dark': '#1c0d21', '--color-brand-light': '#f0f0f0', '--color-brand-accent': '#ea00d9', '--color-brand-accent-dark': '#0abdc6' } },
    { id: 'graphite-gold', name: 'Graphite & Gold', colors: { '--color-brand-dark': '#1c1c1c', '--color-brand-secondary-dark': '#333333', '--color-brand-light': '#f5f5f5', '--color-brand-accent': '#ffd700', '--color-brand-accent-dark': '#ffc400' } },
    { id: 'solar-flare', name: 'Solar Flare', colors: { '--color-brand-dark': '#212121', '--color-brand-secondary-dark': '#424242', '--color-brand-light': '#fffde7', '--color-brand-accent': '#ffc107', '--color-brand-accent-dark': '#ffa000' } },
    { id: 'matrix-green', name: 'Matrix Green', colors: { '--color-brand-dark': '#000000', '--color-brand-secondary-dark': '#0d0d0d', '--color-brand-light': '#f0fff0', '--color-brand-accent': '#00ff00', '--color-brand-accent-dark': '#00e600' } },
    { id: 'rose-quartz', name: 'Rose Quartz', colors: { '--color-brand-dark': '#4a2c3a', '--color-brand-secondary-dark': '#6d4559', '--color-brand-light': '#fce4ec', '--color-brand-accent': '#f06292', '--color-brand-accent-dark': '#ec407a' } },
];

const applyTheme = (colors: Record<string, string>) => {
    const root = document.documentElement;
    Object.keys(colors).forEach(key => {
        root.style.setProperty(key, colors[key]);
    });
};


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allLoggedInUsers, setAllLoggedInUsers] = useState<User[]>([]);
    const [authReady, setAuthReady] = useState<boolean>(false);
    const [isAddingAccount, setIsAddingAccount] = useState<boolean>(false);
    const [activeThemeId, setActiveThemeId] = useState('default');

    useEffect(() => {
        // Apply theme on initial load
        const savedThemeId = localStorage.getItem('theme') || 'default';
        const savedTheme = themes.find(t => t.id === savedThemeId);
        if (savedTheme) {
            applyTheme(savedTheme.colors);
            setActiveThemeId(savedTheme.id);
        } else {
             // Fallback to default if saved theme is no longer available
            const defaultTheme = themes[0];
            applyTheme(defaultTheme.colors);
            localStorage.setItem('theme', defaultTheme.id);
            setActiveThemeId(defaultTheme.id);
        }

        // Check for an existing session when the app loads
        const activeUser = getActiveUser();
        const allUsers = getAllLoggedInUsers();
        setCurrentUser(activeUser);
        setAllLoggedInUsers(allUsers);
        setAuthReady(true);
    }, []);

    const handleLoginSuccess = (user: User) => {
        const allUsers = getAllLoggedInUsers();
        setCurrentUser(user);
        setAllLoggedInUsers(allUsers);
        setIsAddingAccount(false);
    };

    const handleLogout = async () => {
        if (!currentUser) return;
        const { newActiveUser, allUsers } = await logout(currentUser.id);
        setCurrentUser(newActiveUser);
        setAllLoggedInUsers(allUsers);
    };
    
    const handleSwitchAccount = async (userId: string) => {
        const newActiveUser = await switchActiveUser(userId);
        setCurrentUser(newActiveUser);
        showToast(`Switched to ${newActiveUser?.username}`, 'info');
    };

    const handleAddAccount = () => {
        setIsAddingAccount(true);
    };

    const handleUserUpdate = (updatedUser: User) => {
        setCurrentUser(updatedUser);
        setAllLoggedInUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleThemeChange = (themeId: string) => {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
            applyTheme(theme.colors);
            localStorage.setItem('theme', theme.id);
            setActiveThemeId(theme.id);
        }
    };

    if (!authReady) {
        return <div className="min-h-screen bg-brand-dark" />;
    }
    
    const renderContent = () => {
        if (currentUser && !isAddingAccount) {
            return (
                <div className="relative z-10 flex flex-col min-h-screen">
                    <main className="flex-grow">
                        <DashboardPage
                            user={currentUser}
                            onLogout={handleLogout}
                            onUpdateUser={handleUserUpdate}
                            themes={themes}
                            activeThemeId={activeThemeId}
                            onThemeChange={handleThemeChange}
                            allUsers={allLoggedInUsers}
                            onSwitchAccount={handleSwitchAccount}
                            onAddAccount={handleAddAccount}
                         />
                    </main>
                </div>
            );
        }

        if (isAddingAccount) {
            return (
                <div className="relative z-10 flex flex-col min-h-screen items-center justify-center p-4">
                    <AuthPage onLogin={handleLoginSuccess} isAddingAccount onCancel={() => setIsAddingAccount(false)} />
                </div>
            )
        }
        
        // Default to logged-out view
        return (
             <div className="relative z-10 flex flex-col min-h-screen items-center justify-center p-4">
                <AuthPage onLogin={handleLoginSuccess} />
            </div>
        )
    };
    
    return (
        <div className="min-h-screen bg-brand-dark text-brand-light font-sans">
            <DynamicBackground />
            <ToastContainer />
            {renderContent()}
        </div>
    );
};

export default App;