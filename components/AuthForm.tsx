import React, { useState } from 'react';

interface AuthFormProps {
    formType: 'login' | 'signup';
    onSubmit: (username: string, password: string) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ formType, onSubmit }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await onSubmit(username, password);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const isButtonDisabled = !username.trim() || !password.trim() || isLoading;
    const title = formType === 'login' ? 'Welcome Back' : 'Create an Account';
    const buttonText = formType === 'login' ? 'Login' : 'Sign Up';
    const loadingText = formType === 'login' ? 'Logging in...' : 'Creating Account...';

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white/5 backdrop-blur-md rounded-xl shadow-2xl border border-white/10">
            <h2 className="text-3xl font-bold text-center text-white">{title}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 w-full p-3 bg-white/5 border border-white/10 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-200 placeholder-gray-500"
                        placeholder="Enter your username"
                        disabled={isLoading}
                    />
                </div>
                 <div>
                    <label htmlFor="password"className="block text-sm font-medium text-gray-300">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete={formType === 'login' ? 'current-password' : 'new-password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full p-3 bg-white/5 border border-white/10 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-200 placeholder-gray-500"
                        placeholder="Enter your password"
                        disabled={isLoading}
                    />
                </div>
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                 <div>
                    <button
                        type="submit"
                        disabled={isButtonDisabled}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-gradient-to-r from-brand-accent to-purple-500 hover:from-brand-accent-dark hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-accent-dark disabled:bg-gray-600 disabled:bg-none disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {isLoading ? loadingText : buttonText}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AuthForm;
