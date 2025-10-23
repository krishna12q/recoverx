import React from 'react';

// List of available avatar IDs for users to choose from.
export const avatarList: string[] = [
    'avatar-01', 'avatar-02', 'avatar-03', 'avatar-04',
    'avatar-05', 'avatar-06', 'avatar-07', 'avatar-08',
    'avatar-09', 'avatar-10', 'avatar-11', 'avatar-12',
];

interface AvatarProps {
    avatarId?: string;
    size?: number;
}

const AdminMatrixIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H8V8H4V4Z" fill="currentColor" className="text-green-400" />
        <path d="M4 10H8V14H4V10Z" fill="currentColor" className="text-green-500" />
        <path d="M4 16H8V20H4V16Z" fill="currentColor" className="text-green-600" />
        <path d="M10 4H14V8H10V4Z" fill="currentColor" className="text-green-300" />
        <path d="M10 10H14V14H10V10Z" fill="currentColor" className="text-green-400" />
        <path d="M10 16H14V20H10V16Z" fill="currentColor" className="text-green-500" />
        <path d="M16 4H20V8H16V4Z" fill="currentColor" className="text-green-200" />
        <path d="M16 10H20V14H16V10Z" fill="currentColor" className="text-green-300" />
        <path d="M16 16H20V20H16V16Z" fill="currentColor" className="text-green-400" />
    </svg>
);


const AVATARS: Record<string, React.FC<{ size: number }>> = {
    'avatar-01': ({ size }) => ( // Short Hair
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_9_2)"><rect width="24" height="24" rx="12" fill="#FFC107"/><path d="M25.4086 21.1189C25.4086 17.5878 22.3833 14.7368 18.6657 14.7368C14.9481 14.7368 11.9228 17.5878 11.9228 21.1189" stroke="#9C27B0" strokeWidth="2.5"/><path d="M19.7828 12.0163C19.7828 10.3756 18.5794 9.07895 17.0673 9.07895C15.5552 9.07895 14.3518 10.3756 14.3518 12.0163V14.2105H19.7828V12.0163Z" fill="#9C27B0"/><circle cx="12" cy="12" r="1.5" fill="#9C27B0"/></g><defs><clipPath id="clip0_9_2"><rect width="24" height="24" rx="12" fill="white"/></clipPath></defs></svg>
    ),
    'avatar-02': ({ size }) => ( // Glasses
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#4CAF50"/><circle cx="8" cy="11" r="3" stroke="white" strokeWidth="2"/><circle cx="16" cy="11" r="3" stroke="white" strokeWidth="2"/><path d="M11 11H13" stroke="white" strokeWidth="2"/><path d="M7 20C7 17.2386 9.23858 15 12 15C14.7614 15 17 17.2386 17 20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    'avatar-03': ({ size }) => ( // Long Hair
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#2196F3"/><path d="M18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9V15H18V9Z" fill="#F44336"/><path d="M7 20C7 17.2386 9.23858 15 12 15C14.7614 15 17 17.2386 17 20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    'avatar-04': ({ size }) => ( // Headphones
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#E91E63"/><rect x="4" y="10" width="4" height="6" rx="2" fill="white"/><rect x="16" y="10" width="4" height="6" rx="2" fill="white"/><path d="M8 12C8 7.58172 11.5817 4 16 4" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M7 20C7 17.2386 9.23858 15 12 15C14.7614 15 17 17.2386 17 20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    'avatar-05': ({ size }) => ( // Beanie
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#673AB7"/><path d="M6 9C6 6.79086 7.79086 5 10 5H14C16.2091 5 18 6.79086 18 9V10H6V9Z" fill="#FFEB3B"/><path d="M7 20C7 17.2386 9.23858 15 12 15C14.7614 15 17 17.2386 17 20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    'avatar-06': ({ size }) => ( // Side Profile
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#00BCD4"/><path d="M15 6C15 8.20914 13.2091 10 11 10H8V15C8 17.7614 10.2386 20 13 20H15" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M15 11L17 11" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    'avatar-07': ({ size }) => ( // Spiky Hair
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#FF9800"/><path d="M9 10L6 4L12 8L18 4L15 10H9Z" fill="#3F51B5"/><path d="M7 20C7 17.2386 9.23858 15 12 15C14.7614 15 17 17.2386 17 20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    'avatar-08': ({ size }) => ( // Cap
         <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#795548"/><path d="M6 10C6 7.79086 7.79086 6 10 6H14C16.2091 6 18 7.79086 18 10V11H6V10Z" fill="#CDDC39"/><path d="M18 10H21C21.5523 10 22 10.4477 22 11V11C22 11.5523 21.5523 12 21 12H18V10Z" fill="#CDDC39"/><path d="M7 20C7 17.2386 9.23858 15 12 15C14.7614 15 17 17.2386 17 20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    'avatar-09': ({ size }) => ( // Ponytail
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#607D8B"/><path d="M15 6H9C7.34315 6 6 7.34315 6 9V13C6 14.6569 7.34315 16 9 16H11" stroke="#FF5722" strokeWidth="2" strokeLinecap="round"/><path d="M11 11H18C19.6569 11 21 12.3431 21 14V14C21 15.6569 19.6569 17 18 17H16" stroke="#FF5722" strokeWidth="2" strokeLinecap="round"/><path d="M7 20C7 17.2386 9.23858 15 12 15C14.7614 15 17 17.2386 17 20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    'avatar-10': ({ size }) => ( // Action figure
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#03A9F4"/><circle cx="12" cy="7" r="3" fill="white"/><path d="M12 10V16" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M9 19L12 16L15 19" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M12 13L16 11" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M12 13L8 11" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    'avatar-11': ({ size }) => ( // Abstract Face
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#9E9E9E"/><circle cx="9" cy="10" r="1.5" fill="white"/><circle cx="15" cy="10" r="1.5" fill="white"/><path d="M9 15C9 16.1046 9.89543 17 11 17H13C14.1046 17 15 16.1046 15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    'avatar-12': ({ size }) => ( // Running figure
         <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#3F51B5"/><circle cx="14" cy="6" r="2" fill="white"/><path d="M14 8L10 13L8 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 13L7 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 16L17 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
};


const Avatar: React.FC<AvatarProps> = ({ avatarId = 'avatar-01', size = 32 }) => {
    if (avatarId === 'admin-matrix') {
        return <AdminMatrixIcon size={size} />;
    }
    
    const AvatarComponent = AVATARS[avatarId] || AVATARS['avatar-01'];

    return <AvatarComponent size={size} />;
};

export default Avatar;