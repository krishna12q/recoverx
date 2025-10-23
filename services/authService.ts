import type { User } from '../types';

// WARNING: This service simulates a real backend API but uses localStorage as a mock database.
// It is NOT secure for production. The goal is to structure the frontend code correctly for a real API.

const MOCK_DB_USERS_KEY = 'recoverx_users_db';
const SESSIONS_KEY = 'recoverx_sessions';
const ACTIVE_USER_ID_KEY = 'recoverx_active_user_id';
const MOCK_DB_REPORTS_KEY = 'recoverx_reports_db';
const MOCK_DB_LOGS_KEY = 'recoverx_logs_db';
const MOCK_DB_CHATS_KEY = 'recoverx_chats_db';

interface Session {
    userId: string;
    username: string;
    token: string;
}

// --- Mock Database Functions (simulates what a real database would do on a server) ---

/**
 * Ensures the admin user exists and has the correct, non-modifiable properties (like password and role).
 * This function runs on app start to prevent data corruption.
 */
const ensureAdminUser = (users: User[]): { updatedUsers: User[], wasChanged: boolean } => {
    let wasChanged = false;
    // Find admin by a stable ID first, fallback to username (case-insensitive)
    const adminIndex = users.findIndex(u => u.id === 'admin-user-001' || (u.username && u.username.toLowerCase() === 'admin'));
    const adminPasswordHash = btoa('admin@2011');

    if (adminIndex > -1) {
        // Admin user exists, verify its critical properties.
        const adminUser = users[adminIndex];
        let needsUpdate = false;

        // Correct any critical data drift
        if (adminUser.username !== 'admin') { adminUser.username = 'admin'; needsUpdate = true; }
        if (adminUser.passwordHash !== adminPasswordHash) { adminUser.passwordHash = adminPasswordHash; needsUpdate = true; }
        if (adminUser.role !== 'admin') { adminUser.role = 'admin'; needsUpdate = true; }
        if (adminUser.id !== 'admin-user-001') { adminUser.id = 'admin-user-001'; needsUpdate = true; }
        if (adminUser.avatarId !== 'admin-matrix') { adminUser.avatarId = 'admin-matrix'; needsUpdate = true; }

        if (needsUpdate) {
            users[adminIndex] = { ...users[adminIndex], ...adminUser }; // Ensure we merge, though we overwrite most things
            wasChanged = true;
            console.warn("Admin user data was corrected to defaults.");
        }
    } else {
        // Admin user does not exist, create it.
        console.log("Admin user not found, seeding...");
        const adminUser: User = {
            id: 'admin-user-001',
            username: 'admin',
            passwordHash: adminPasswordHash,
            bio: 'Application Administrator',
            primaryInjury: 'N/A',
            privacySettings: { anonymousDataSharing: false },
            createdAt: new Date().toISOString(),
            role: 'admin',
            avatarId: 'admin-matrix',
        };
        users.unshift(adminUser); // Add to the start of the list
        wasChanged = true;
    }
    return { updatedUsers: users, wasChanged };
};

const getMockDbUsers = (): User[] => {
    try {
        let users: User[] = [];
        const usersStr = localStorage.getItem(MOCK_DB_USERS_KEY);
        if (usersStr) {
            users = JSON.parse(usersStr);
        }
        
        const { updatedUsers, wasChanged } = ensureAdminUser(users);
        if (wasChanged) {
            saveMockDbUsers(updatedUsers);
        }

        return updatedUsers;
    } catch (e) {
        // If parsing fails, start with a fresh list
        const { updatedUsers, wasChanged } = ensureAdminUser([]);
        if (wasChanged) {
            saveMockDbUsers(updatedUsers);
        }
        return updatedUsers;
    }
};

const saveMockDbUsers = (users: User[]) => {
    localStorage.setItem(MOCK_DB_USERS_KEY, JSON.stringify(users));
};

// --- Session Helper Functions ---

const getSessions = (): Session[] => {
    try {
        const sessions = localStorage.getItem(SESSIONS_KEY);
        return sessions ? JSON.parse(sessions) : [];
    } catch (e) {
        return [];
    }
};

const saveSessions = (sessions: Session[]) => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

const setActiveUserId = (userId: string | null) => {
    if (userId) {
        localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
    } else {
        localStorage.removeItem(ACTIVE_USER_ID_KEY);
    }
};

const getActiveUserId = (): string | null => {
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
};


// --- API-like Service Functions ---

/**
 * Simulates a POST request to a `/api/auth/signup` endpoint.
 */
export const signUp = (username: string, password: string): Promise<User> => {
    console.log("Simulating API call to: POST /api/auth/signup");
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network delay
            const users = getMockDbUsers();
            if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                return reject(new Error('Username already exists.'));
            }
            const newUser: User = {
                id: crypto.randomUUID(),
                username,
                passwordHash: btoa(password), // Simple "hashing"
                bio: '',
                primaryInjury: '',
                privacySettings: { anonymousDataSharing: true },
                createdAt: new Date().toISOString(),
                role: 'user',
                avatarId: 'avatar-01', // Default avatar
            };
            users.push(newUser);
            saveMockDbUsers(users);

            const userForClient: Partial<User> = { ...newUser };
            delete userForClient.passwordHash;

            const sessions = getSessions();
            const mockToken = btoa(JSON.stringify({ userId: newUser.id, username: newUser.username }));
            sessions.push({ userId: newUser.id, username: newUser.username, token: mockToken });
            saveSessions(sessions);
            setActiveUserId(newUser.id);

            resolve(userForClient as User);
        }, 500);
    });
};

/**
 * Simulates a POST request to a `/api/auth/login` endpoint.
 * If user is already logged in, it just switches to them.
 */
export const login = (username: string, password: string): Promise<User> => {
     console.log("Simulating API call to: POST /api/auth/login");
     return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network delay
            const users = getMockDbUsers();
            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
            
            if (user && user.passwordHash === btoa(password)) {
                const userForClient: Partial<User> = { ...user };
                delete userForClient.passwordHash;
                
                // Assign role
                userForClient.role = user.username === 'admin' ? 'admin' : 'user';

                let sessions = getSessions();
                const existingSession = sessions.find(s => s.userId === user.id);

                if (!existingSession) {
                    const mockToken = btoa(JSON.stringify({ userId: user.id, username: user.username }));
                    sessions.push({ userId: user.id, username: user.username, token: mockToken });
                    saveSessions(sessions);
                }
                
                setActiveUserId(user.id);
                resolve(userForClient as User);
            } else {
                reject(new Error('Invalid username or password.'));
            }
        }, 500);
    });
};

/**
 * Logs out the specified user. If they were active, switches to another user.
 */
export const logout = (userIdToLogout: string): Promise<{ newActiveUser: User | null, allUsers: User[] }> => {
    console.log(`Logging out user: ${userIdToLogout}`);
    return new Promise((resolve) => {
        let sessions = getSessions();
        const activeUserId = getActiveUserId();
        
        sessions = sessions.filter(s => s.userId !== userIdToLogout);
        saveSessions(sessions);

        if (activeUserId === userIdToLogout) {
            const newActiveSession = sessions.length > 0 ? sessions[0] : null;
            setActiveUserId(newActiveSession ? newActiveSession.userId : null);
        }

        const newActiveUser = getActiveUser();
        const allUsers = getAllLoggedInUsers();

        resolve({ newActiveUser, allUsers });
    });
};

/**
 * Gets the current active user based on the stored active user ID.
 */
export const getActiveUser = (): User | null => {
    const activeUserId = getActiveUserId();
    if (!activeUserId) return null;

    const allUsers = getMockDbUsers();
    const user = allUsers.find(u => u.id === activeUserId);

    if (!user) {
        // Data inconsistency, clear bad active user ID
        setActiveUserId(null);
        return null;
    }
    
    const userForClient: Partial<User> = { ...user };
    delete userForClient.passwordHash;
    userForClient.role = user.username === 'admin' ? 'admin' : 'user';
    return userForClient as User;
};


/**
 * Retrieves all users who have an active session.
 */
export const getAllLoggedInUsers = (): User[] => {
    const sessions = getSessions();
    const allUsersDb = getMockDbUsers();

    return sessions.map(session => {
        const user = allUsersDb.find(u => u.id === session.userId);
        if (user) {
            const userForClient: Partial<User> = { ...user };
            delete userForClient.passwordHash;
            userForClient.role = user.username === 'admin' ? 'admin' : 'user';
            return userForClient as User;
        }
        return null;
    }).filter((u): u is User => u !== null);
};


/**
 * Switches the active user.
 */
export const switchActiveUser = (userId: string): Promise<User | null> => {
    return new Promise((resolve) => {
        const sessions = getSessions();
        if (sessions.some(s => s.userId === userId)) {
            setActiveUserId(userId);
            resolve(getActiveUser());
        } else {
            resolve(null);
        }
    });
};


/**
 * Simulates a PUT request to `/api/users/:userId`.
 */
export const updateUserProfile = (user: User, updates: Partial<User>): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getMockDbUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex === -1) {
                return reject(new Error("User not found"));
            }

            const updatedUser = { ...users[userIndex], ...updates };
            users[userIndex] = updatedUser;
            saveMockDbUsers(users);
            
            if (updates.username) {
                const sessions = getSessions();
                const sessionIndex = sessions.findIndex(s => s.userId === user.id);
                if(sessionIndex > -1) {
                    sessions[sessionIndex].username = updatedUser.username;
                    const newToken = btoa(JSON.stringify({ userId: updatedUser.id, username: updatedUser.username }));
                    sessions[sessionIndex].token = newToken;
                    saveSessions(sessions);
                }
            }

            const userForClient: Partial<User> = { ...updatedUser };
            delete userForClient.passwordHash;
            userForClient.role = userForClient.username === 'admin' ? 'admin' : 'user';

            resolve(userForClient as User);
        }, 300);
    });
};


/**
 * Simulates a DELETE request to `/api/users/:userId`.
 */
export const deleteUserData = (user: User): Promise<void> => {
     return new Promise((resolve, reject) => {
        if (user.role === 'admin') {
            return reject(new Error("Admin user data cannot be deleted."));
        }
        setTimeout(() => {
            // Delete user from DB
            const users = getMockDbUsers().filter(u => u.id !== user.id);
            saveMockDbUsers(users);

            // Delete from sessions
            logout(user.id);

            // Delete reports, logs, chats...
            const reports = (JSON.parse(localStorage.getItem(MOCK_DB_REPORTS_KEY) || '[]') as any[]).filter(r => r.userId !== user.id);
            localStorage.setItem(MOCK_DB_REPORTS_KEY, JSON.stringify(reports));

            const logs = (JSON.parse(localStorage.getItem(MOCK_DB_LOGS_KEY) || '[]') as any[]).filter(l => l.userId !== user.id);
            localStorage.setItem(MOCK_DB_LOGS_KEY, JSON.stringify(logs));

            const chats = (JSON.parse(localStorage.getItem(MOCK_DB_CHATS_KEY) || '[]') as any[]).filter(c => c.userId !== user.id);
            localStorage.setItem(MOCK_DB_CHATS_KEY, JSON.stringify(chats));

            resolve();
        }, 500);
    });
};

/**
 * FOR ADMIN USE ONLY
 * Retrieves all users from the mock database, without filtering for sessions.
 */
export const getAllUsersForAdmin = (): Promise<User[]> => {
    return new Promise(resolve => {
        const allUsers = getMockDbUsers();
        const usersForClient = allUsers.map(u => {
            const user: Partial<User> = { ...u };
            delete user.passwordHash;
            return user as User;
        });
        resolve(usersForClient);
    });
};