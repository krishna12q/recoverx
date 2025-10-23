import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import { login, signUp } from '../services/authService';
import type { User } from '../types';
import Logo from '../components/Logo';

interface AuthPageProps {
    onLogin: (user: User) => void;
    isAddingAccount?: boolean;
    onCancel?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, isAddingAccount = false, onCancel }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    const handleAuth = async (authFn: typeof login | typeof signUp, username: string, password: string) => {
        const user = await authFn(username, password);
        onLogin(user);
    }
    
    return (
        <div className="w-full flex flex-col items-center justify-center text-center opacity-0 animate-fade-in-up">
            {!isAddingAccount && (
                <div className="flex items-center space-x-3 mb-8">
                    <Logo size={40} />
                    <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">RecoverX</span>
                </div>
            )}
            <div className="w-full max-w-md">
                 <AuthForm 
                    key={isLoginView ? 'login' : 'signup'}
                    formType={isLoginView ? 'login' : 'signup'}
                    onSubmit={(username, password) => handleAuth(isLoginView ? login : signUp, username, password)}
                />
                <div className="mt-6 flex flex-col items-center gap-4">
                    <p className="text-center text-sm text-gray-400">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-brand-accent hover:text-brand-accent-dark focus:outline-none">
                            {isLoginView ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                    {isAddingAccount && onCancel && (
                         <button onClick={onCancel} className="text-sm font-medium text-gray-400 hover:text-white focus:outline-none">
                            Cancel
                        </button>
                    )}
                </div>
                 {!isAddingAccount && <p className="mt-4 text-xs text-gray-600 text-center px-4">
                    Note: This is a demo application with a mock backend. User data is stored in your browser's local storage for persistence across sessions.
                </p>}
            </div>
        </div>
    );
};

export default AuthPage;