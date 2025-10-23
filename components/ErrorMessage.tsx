import React from 'react';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return (
        <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg shadow-lg" role="alert">
            <p className="font-bold">An Error Occurred</p>
            <div className="mt-2 whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{ __html: message.replace(/`(.*?)`/g, '<code class="bg-red-900 px-1 py-0.5 rounded text-red-100">$1</code>') }} />
        </div>
    );
};

export default ErrorMessage;
