import React, { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface FeedbackModalProps {
    isOpen: boolean;
    feedback: string | null;
    isLoading: boolean;
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, feedback, isLoading, onClose }) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="relative bg-brand-secondary-dark w-full max-w-md p-6 rounded-2xl shadow-2xl border border-white/10 opacity-0 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-full bg-brand-secondary-dark flex items-center justify-center flex-shrink-0 border-2 border-brand-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 011.5 1.5v1.25a1 1 0 001 1h.25a1.5 1.5 0 011.5 1.5v.5a1 1 0 001 1h.5a1.5 1.5 0 010 3h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-1.5 1.5h-.25a1 1 0 00-1 1v1.25a1.5 1.5 0 01-1.5 1.5h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 01-1.5-1.5v-1.25a1 1 0 00-1-1h-.25a1.5 1.5 0 01-1.5-1.5v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3h.5a1 1 0 001-1v-.5a1.5 1.5 0 011.5-1.5H6a1 1 0 001-1V3.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">AI Coach Feedback</h2>
                </div>
                
                <div className="min-h-[100px] flex items-center justify-center">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <p className="text-gray-300 text-left w-full whitespace-pre-line">{feedback}</p>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg font-semibold text-white bg-brand-accent hover:bg-brand-accent-dark transition-colors"
                        aria-label="Close feedback modal"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;