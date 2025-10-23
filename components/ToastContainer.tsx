import React, { useState, useEffect } from 'react';
import type { ToastMessage } from '../hooks/useToast';

const Toast: React.FC<{ message: ToastMessage, onDismiss: (id: number) => void }> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(message.id);
        }, 4000); // Auto-dismiss after 4 seconds

        return () => clearTimeout(timer);
    }, [message.id, onDismiss]);

    const baseClasses = "relative w-full max-w-sm p-4 mb-2 rounded-lg shadow-2xl border text-white transition-all duration-300 transform";
    const typeClasses = {
        info: 'bg-brand-secondary-dark/80 backdrop-blur-md border-brand-accent',
        success: 'bg-green-800/80 backdrop-blur-md border-green-500',
        error: 'bg-red-900/80 backdrop-blur-md border-red-700'
    };
    
    const icons = {
        info: 'ℹ️',
        success: '🎉',
        error: '🔥'
    }

    return (
        <div 
            className={`${baseClasses} ${typeClasses[message.type]} animate-toast-in`}
            role="alert"
        >
            <div className="flex items-center">
                 <span className="mr-3 text-xl">{icons[message.type]}</span>
                <p className="font-semibold">{message.message}</p>
                <button 
                    onClick={() => onDismiss(message.id)}
                    className="absolute top-1 right-1 p-1 text-gray-300 hover:text-white"
                    aria-label="Close"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                </button>
            </div>
        </div>
    );
};


const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const handleShowToast = (e: CustomEvent<Omit<ToastMessage, 'id'>>) => {
            const newToast: ToastMessage = {
                id: Date.now(),
                ...e.detail
            };
            setToasts(currentToasts => [newToast, ...currentToasts]);
        };
        
        const listener = (e: Event) => handleShowToast(e as CustomEvent);

        window.addEventListener('show-toast', listener);

        return () => {
            window.removeEventListener('show-toast', listener);
        };
    }, []);
    
    const dismissToast = (id: number) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    };

    return (
        <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast} onDismiss={dismissToast} />
            ))}
        </div>
    );
};

export default ToastContainer;
