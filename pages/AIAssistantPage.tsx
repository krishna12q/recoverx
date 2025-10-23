import React, { useState, useEffect, useRef } from 'react';
import type { User, ChatMessage as ChatMessageType, SavedChat, InjuryReport } from '../types';
import { generateChatStream } from '../services/geminiService';
import { getSavedChatsForUser, saveChat, deleteChat, updateChat } from '../services/chatService';
import { showToast } from '../hooks/useToast';
import ChatMessage from '../components/ChatMessage';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';


interface AIAssistantPageProps {
    user: User;
    injuryContext?: InjuryReport | null;
    onContextConsumed?: () => void;
}

const initialWelcomeMessage: ChatMessageType = { 
    role: 'model', 
    text: "Hello! I am your AI Recovery Assistant. To help me understand your situation, please start by describing your injury. For example, tell me what happened, where it hurts, and the type of pain you're experiencing.\n\nPlease remember, I'm here to offer general information and support. It's always best to consult with a qualified healthcare provider for specific medical advice." 
};

const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ user, injuryContext, onContextConsumed }) => {
    const [messages, setMessages] = useState<ChatMessageType[]>([initialWelcomeMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const fetchSavedChats = async () => {
        setIsLoadingChats(true);
        try {
            const chats = await getSavedChatsForUser(user);
            setSavedChats(chats);
        } catch (err) {
            showToast("Failed to load saved chats.", 'error');
        } finally {
            setIsLoadingChats(false);
        }
    };

    useEffect(() => {
        fetchSavedChats();
    }, [user]);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (injuryContext && onContextConsumed) {
            // Start a new chat with the context
            handleNewChat(); // This resets state

            const contextMessage: ChatMessageType = {
                role: 'user',
                text: `I'd like to discuss my previous injury: "${injuryContext.plan.injury}".\n\nMy original description was: "${injuryContext.userDescription}"\n\nI can provide updates on how it's feeling now.`
            };
            
            // Use a function for setState to ensure we're updating after the reset from handleNewChat
            setMessages(prevMessages => [prevMessages[0], contextMessage]);

            // Clear context in parent so it's not reused on navigation
            onContextConsumed();
        }
    }, [injuryContext, onContextConsumed]);

    const handleNewChat = () => {
        setActiveChatId(null);
        setMessages([initialWelcomeMessage]);
        setError(null);
        setIsLoading(false);
    };

    const handleLoadChat = (chat: SavedChat) => {
        setActiveChatId(chat.id);
        setMessages(chat.messages);
        setError(null);
        setIsLoading(false);
    };

    const handleSaveChat = async () => {
        // Don't save if it's just the initial welcome message
        if (messages.length <= 1 && messages[0].role === 'model') {
            showToast("Cannot save an empty chat.", 'info');
            return;
        }
        
        if (activeChatId) {
            // This is an existing chat, so we update it.
            try {
                const updatedChat = await updateChat(user, activeChatId, messages);
                // Update the chat in the sidebar list
                setSavedChats(prev => prev.map(c => c.id === activeChatId ? updatedChat : c));
                showToast("Chat updated successfully!", 'success');
            } catch (err) {
                showToast("Failed to update chat.", 'error');
            }
        } else {
            // This is a new chat, prompt for title.
            const title = window.prompt("Enter a title for this chat:", "New Conversation");
            if (title) {
                try {
                    const newSavedChat = await saveChat(user, messages, title);
                    // Add new chat and re-sort
                    setSavedChats(prev => [newSavedChat, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                    setActiveChatId(newSavedChat.id);
                    showToast("Chat saved successfully!", 'success');
                } catch (err) {
                    showToast("Failed to save chat.", 'error');
                }
            }
        }
    };
    
    const handleDeleteChat = async (chatId: string) => {
        if (window.confirm("Are you sure you want to delete this chat?")) {
            try {
                await deleteChat(user, chatId);
                setSavedChats(prev => prev.filter(c => c.id !== chatId));
                if (activeChatId === chatId) {
                    handleNewChat();
                }
                showToast("Chat deleted.", 'success');
            } catch (err) {
                showToast("Failed to delete chat.", 'error');
            }
        }
    }

    const handleStream = async (history: ChatMessageType[]) => {
        try {
            const stream = await generateChatStream(history);
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    const updatedLastMessage = { ...lastMessage, text: lastMessage.text + chunkText };
                    return [...prev.slice(0, -1), updatedLastMessage];
                });
            }
        } catch (err: any) {
            const errorMessage = err.message || "Sorry, I'm having trouble connecting. Please try again.";
            setError(errorMessage);
            setMessages(prev => [...prev, { role: 'model', text: `Error: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessageType = { role: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setError(null);

        await handleStream(newMessages);
    };
    
    const TypingIndicator = () => (
        <div className="flex items-start gap-3 w-full flex-row">
            <div className="w-8 h-8 rounded-full bg-brand-secondary-dark flex items-center justify-center flex-shrink-0 border-2 border-brand-accent">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 011.5 1.5v1.25a1 1 0 001 1h.25a1.5 1.5 0 011.5 1.5v.5a1 1 0 001 1h.5a1.5 1.5 0 010 3h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-1.5 1.5h-.25a1 1 0 00-1 1v1.25a1.5 1.5 0 01-1.5 1.5h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 01-1.5-1.5v-1.25a1 1 0 00-1-1h-.25a1.5 1.5 0 01-1.5-1.5v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3h.5a1 1 0 001-1v-.5a1.5 1.5 0 011.5-1.5H6a1 1 0 001-1V3.5z" />
                </svg>
            </div>
            <div className="max-w-[80%] rounded-xl px-4 py-3 bg-brand-secondary-dark flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
            </div>
        </div>
    );
    
    const activeChatTitle = activeChatId ? savedChats.find(c => c.id === activeChatId)?.title : "New Chat";
    const saveButtonText = activeChatId ? "Update Chat" : "Save Chat";

    return (
        <div className="w-full max-w-6xl mx-auto flex h-[calc(100vh-200px)] bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 opacity-0 animate-fade-in-up overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <button onClick={handleNewChat} className="w-full text-center py-2 px-4 rounded-lg font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors">
                        + New Chat
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoadingChats ? <div className="flex justify-center items-center h-full"><LoadingSpinner/></div> :
                        savedChats.length === 0 ? <p className="p-4 text-sm text-gray-400 text-center">No saved chats yet.</p> :
                        <ul className="p-2 space-y-1">
                            {savedChats.map(chat => (
                                <li key={chat.id} className="group relative">
                                    <button onClick={() => handleLoadChat(chat)} className={`w-full text-left p-2 rounded-md truncate transition-colors ${activeChatId === chat.id ? 'bg-brand-accent' : 'hover:bg-white/10'}`}>
                                        <p className="font-semibold text-sm text-white">{chat.title}</p>
                                        <p className="text-xs text-gray-300 opacity-80">{new Date(chat.createdAt).toLocaleDateString()}</p>
                                    </button>
                                     <button onClick={() => handleDeleteChat(chat.id)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete chat">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    }
                </div>
            </div>

            {/* Main Chat Window */}
            <div className="w-2/3 flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white truncate">{activeChatTitle}</h2>
                    <button onClick={handleSaveChat} className="text-sm py-1.5 px-3 rounded-md font-semibold text-white bg-brand-accent/50 hover:bg-brand-accent transition-colors">
                        {saveButtonText}
                    </button>
                </div>
                
                <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                    ))}
                    {isLoading && <TypingIndicator />}
                </div>

                {error && <div className="p-4"><ErrorMessage message={error}/></div>}
                
                <div className="p-4 border-t border-white/10">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            disabled={isLoading}
                            className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-200 placeholder-gray-500 disabled:opacity-50"
                            aria-label="Chat input"
                        />
                        <button 
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-brand-accent rounded-lg text-white font-semibold hover:bg-brand-accent-dark transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                            aria-label="Send message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
