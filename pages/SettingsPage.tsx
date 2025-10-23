import React, { useState, useEffect } from 'react';
import type { User, Theme } from '../types';
import { updateUserProfile, deleteUserData } from '../services/authService';
import { showToast } from '../hooks/useToast';
import Avatar, { avatarList } from '../components/Avatar';

interface SettingsPageProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onLogout: () => void;
    themes: Theme[];
    activeThemeId: string;
    onThemeChange: (themeId: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpdateUser, onLogout, themes, activeThemeId, onThemeChange }) => {
    const [formData, setFormData] = useState({
        username: user.username,
        bio: user.bio || '',
        primaryInjury: user.primaryInjury || '',
        anonymousDataSharing: user.privacySettings?.anonymousDataSharing ?? true,
        avatarId: user.avatarId || 'avatar-01',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const initialData = {
            username: user.username,
            bio: user.bio || '',
            primaryInjury: user.primaryInjury || '',
            anonymousDataSharing: user.privacySettings?.anonymousDataSharing ?? true,
            avatarId: user.avatarId || 'avatar-01',
        };
        const somethingChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
        setHasChanges(somethingChanged);
    }, [formData, user]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleAvatarChange = (avatarId: string) => {
        setFormData(prev => ({ ...prev, avatarId }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanges) return;

        setIsSaving(true);
        try {
            const updates: Partial<User> = {
                username: formData.username,
                bio: formData.bio,
                primaryInjury: formData.primaryInjury,
                privacySettings: { anonymousDataSharing: formData.anonymousDataSharing },
                avatarId: formData.avatarId,
            };
            const updatedUser = await updateUserProfile(user, updates);
            onUpdateUser(updatedUser);
            showToast('Profile updated successfully!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to update profile.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteData = async () => {
        if(user.role === 'admin') {
            showToast("Admin account cannot be deleted.", "error");
            return;
        }
        const confirmation = window.prompt("This action is irreversible. To confirm, please type 'DELETE' in the box below.");
        if (confirmation === 'DELETE') {
            try {
                showToast('Deleting all your data...', 'info');
                await deleteUserData(user);
                onLogout();
            } catch (error: any) {
                showToast(error.message || 'Failed to delete data.', 'error');
            }
        } else if (confirmation !== null) {
            showToast('Deletion cancelled. Incorrect confirmation text.', 'info');
        }
    }

    return (
        <div className="w-full max-w-3xl mx-auto opacity-0 animate-fade-in-up space-y-8">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-white tracking-tight">Settings & Profile</h2>
                <p className="mt-2 text-lg text-gray-400">Manage your personal information and application settings.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Section */}
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-xl shadow-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">Profile Information</h3>
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                            <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="mt-1 w-full p-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-accent transition" disabled={user.role === 'admin'}/>
                        </div>
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-300">Bio</label>
                            <textarea name="bio" id="bio" rows={3} value={formData.bio} onChange={handleChange} className="mt-1 w-full p-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-accent transition resize-none" placeholder="e.g., Amateur basketball player, recovering from a sprain." />
                        </div>
                         <div>
                            <label htmlFor="primaryInjury" className="block text-sm font-medium text-gray-300">Primary Injury</label>
                            <input type="text" name="primaryInjury" id="primaryInjury" value={formData.primaryInjury} onChange={handleChange} className="mt-1 w-full p-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-accent transition" placeholder="e.g., Left Ankle Sprain" />
                        </div>
                    </div>
                </div>

                {/* Avatar Section */}
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-xl shadow-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">Avatar</h3>
                    <p className="text-sm text-gray-400 mb-4">Choose an avatar to represent you across the app.</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                        {user.role === 'admin' && (
                             <button type="button" className="flex items-center justify-center p-2 aspect-square rounded-lg border-2 border-brand-accent bg-brand-accent/10 shadow-lg" aria-label="Admin avatar" disabled>
                                <Avatar avatarId="admin-matrix" size={40} />
                            </button>
                        )}
                        {avatarList.map(id => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => handleAvatarChange(id)}
                                className={`flex items-center justify-center p-2 aspect-square rounded-lg border-2 transition-all ${
                                    formData.avatarId === id ? 'border-brand-accent bg-brand-accent/10 shadow-lg' : 'border-transparent hover:border-white/50'
                                }`}
                                aria-label={`Select avatar ${id}`}
                                disabled={user.role === 'admin'}
                            >
                                <Avatar avatarId={id} size={40} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-xl shadow-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">Appearance</h3>
                     <p className="text-sm text-gray-400 mb-4">Choose a theme to personalize your experience.</p>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                type="button"
                                onClick={() => onThemeChange(theme.id)}
                                className={`block text-center p-2 rounded-lg border-2 transition-all ${
                                    activeThemeId === theme.id ? 'border-brand-accent shadow-lg' : 'border-transparent hover:border-white/50'
                                }`}
                                aria-label={`Select ${theme.name} theme`}
                            >
                                <div
                                    className="w-full h-20 rounded-lg flex items-center justify-center p-2"
                                    style={{ backgroundColor: theme.colors['--color-brand-dark'] }}
                                    aria-hidden="true"
                                >
                                    <div
                                        className="w-full h-full rounded-md p-1.5 flex flex-col justify-between shadow-inner"
                                        style={{ backgroundColor: theme.colors['--color-brand-secondary-dark'] }}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <div className="w-6 h-2 rounded-full" style={{ backgroundColor: theme.colors['--color-brand-accent-dark'] }}></div>
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors['--color-brand-light'], opacity: 0.5 }}></div>
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors['--color-brand-light'], opacity: 0.5 }}></div>
                                        </div>
                                        <div className="space-y-1 self-end w-10/12">
                                            <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: theme.colors['--color-brand-light'], opacity: 0.7 }}></div>
                                            <div className="w-8/12 h-1.5 rounded-full" style={{ backgroundColor: theme.colors['--color-brand-light'], opacity: 0.7 }}></div>
                                        </div>
                                        <div
                                            className="w-8 h-4 rounded self-start"
                                            style={{ backgroundColor: theme.colors['--color-brand-accent'] }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="block text-xs font-medium text-gray-300 mt-2 truncate">{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Privacy Section */}
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-xl shadow-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">Data & Privacy</h3>
                    <div className="flex items-center justify-between">
                         <div>
                            <p className="font-medium text-gray-200">Anonymous Data Sharing</p>
                            <p className="text-sm text-gray-400">Allow your anonymized recovery data to help improve our AI model and insights.</p>
                        </div>
                        <label htmlFor="anonymousDataSharing" className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="anonymousDataSharing" id="anonymousDataSharing" className="sr-only peer" checked={formData.anonymousDataSharing} onChange={handleToggle} />
                          <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-accent/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                     <button type="submit" disabled={!hasChanges || isSaving} className="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-brand-accent to-purple-500 hover:from-brand-accent-dark hover:to-purple-600 disabled:bg-gray-600 disabled:bg-none disabled:cursor-not-allowed transition-all">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

             {/* Danger Zone */}
            <div className="p-6 bg-red-900/20 rounded-xl border border-red-700/50">
                <h3 className="text-xl font-bold text-red-300">Danger Zone</h3>
                <p className="text-sm text-red-400 mt-2">This action cannot be undone. This will permanently delete your account, reports, logs, and all other associated data.</p>
                <div className="mt-4">
                    <button onClick={handleDeleteData} className="px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed transition-colors" disabled={user.role === 'admin'}>
                        Delete All My Data
                    </button>
                </div>
            </div>

        </div>
    );
};

export default SettingsPage;