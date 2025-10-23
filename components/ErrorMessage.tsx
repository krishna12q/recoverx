import React from 'react';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
    return (
        <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg shadow-lg" role="alert">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold">An Error Occurred</p>
                    <div className="mt-2 whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: message.replace(/`(.*?)`/g, '<code class="bg-red-900 px-1 py-0.5 rounded text-red-100">$1</code>') }} />
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="ml-4 flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;