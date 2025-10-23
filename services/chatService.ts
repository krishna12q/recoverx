import type { User, SavedChat, ChatMessage } from '../types';

// WARNING: This service simulates a real API but uses localStorage as a mock database.

const MOCK_DB_CHATS_KEY = 'recoverx_chats_db';

// --- Mock Database Functions ---

const getMockDbChats = (): SavedChat[] => {
    try {
        const chats = localStorage.getItem(MOCK_DB_CHATS_KEY);
        return chats ? JSON.parse(chats) : [];
    } catch (e) {
        return [];
    }
};

const saveMockDbChats = (chats: SavedChat[]) => {
    localStorage.setItem(MOCK_DB_CHATS_KEY, JSON.stringify(chats));
};

// --- API-like Service Functions ---

/**
 * Simulates a GET request to `/api/chats` for a specific user.
 */
export const getSavedChatsForUser = (user: User): Promise<SavedChat[]> => {
    console.log("Simulating API call to: GET /api/chats for user:", user.id);
    return new Promise((resolve) => {
        setTimeout(() => {
            const allChats = getMockDbChats();
            const userChats = allChats
                .filter(chat => chat.userId === user.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            resolve(userChats);
        }, 300);
    });
};

/**
 * FOR ADMIN USE ONLY
 * Simulates a GET request to `/api/admin/chats`.
 */
export const getAllChatsForAdmin = (): Promise<SavedChat[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getMockDbChats());
        }, 100);
    });
};


/**
 * Simulates a POST request to `/api/chats`.
 */
export const saveChat = (user: User, messages: ChatMessage[], title: string): Promise<SavedChat> => {
    console.log("Simulating API call to: POST /api/chats for user:", user.id);
    return new Promise((resolve) => {
        setTimeout(() => {
            const allChats = getMockDbChats();
            const newChat: SavedChat = {
                id: crypto.randomUUID(),
                userId: user.id,
                createdAt: new Date().toISOString(),
                title: title,
                messages: messages,
            };
            allChats.push(newChat);
            saveMockDbChats(allChats);
            resolve(newChat);
        }, 300);
    });
};

/**
 * Simulates a PUT request to `/api/chats/:chatId`.
 */
export const updateChat = (user: User, chatId: string, messages: ChatMessage[]): Promise<SavedChat> => {
    console.log(`Simulating API call to: PUT /api/chats/${chatId} for user:`, user.id);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const allChats = getMockDbChats();
            const chatIndex = allChats.findIndex(c => c.id === chatId && c.userId === user.id);

            if (chatIndex === -1) {
                return reject(new Error("Chat not found or permission denied."));
            }

            const updatedChat = {
                ...allChats[chatIndex],
                messages: messages,
            };

            allChats[chatIndex] = updatedChat;
            saveMockDbChats(allChats);
            resolve(updatedChat);
        }, 300);
    });
};


/**
 * Simulates a DELETE request to `/api/chats/:chatId`.
 */
export const deleteChat = (user: User, chatId: string): Promise<void> => {
    console.log(`Simulating API call to: DELETE /api/chats/${chatId} for user:`, user.id);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let allChats = getMockDbChats();
            const chatToDelete = allChats.find(chat => chat.id === chatId);

            if (!chatToDelete) {
                return reject(new Error("Chat not found."));
            }
            if (chatToDelete.userId !== user.id) {
                return reject(new Error("User does not have permission to delete this chat."));
            }
            
            const updatedChats = allChats.filter(chat => chat.id !== chatId);
            saveMockDbChats(updatedChats);
            resolve();

        }, 300);
    });
};