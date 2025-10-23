import React from 'react';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
    message: ChatMessageType;
}

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center font-bold text-white flex-shrink-0">
        U
    </div>
);

const ModelIcon = () => (
     <div className="w-8 h-8 rounded-full bg-brand-secondary-dark flex items-center justify-center flex-shrink-0 border-2 border-brand-accent">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-accent" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 011.5 1.5v1.25a1 1 0 001 1h.25a1.5 1.5 0 011.5 1.5v.5a1 1 0 001 1h.5a1.5 1.5 0 010 3h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-1.5 1.5h-.25a1 1 0 00-1 1v1.25a1.5 1.5 0 01-1.5 1.5h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 01-1.5-1.5v-1.25a1 1 0 00-1-1h-.25a1.5 1.5 0 01-1.5-1.5v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3h.5a1 1 0 001-1v-.5a1.5 1.5 0 011.5-1.5H6a1 1 0 001-1V3.5z" />
        </svg>
    </div>
);


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';

    // Simple function to remove common markdown characters
    const cleanText = (text: string) => {
        return text ? text.replace(/[*#]/g, '') : '';
    };

    return (
        <div className={`flex items-start gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {isUser ? <UserIcon /> : <ModelIcon />}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-white ${isUser ? 'bg-brand-accent' : 'bg-brand-secondary-dark'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{cleanText(message.text)}</p>
            </div>
        </div>
    );
};

export default ChatMessage;