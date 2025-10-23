export type ToastType = 'success' | 'info' | 'error';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

export const showToast = (message: string, type: ToastType = 'info') => {
    const event = new CustomEvent<Omit<ToastMessage, 'id'>>('show-toast', {
        detail: { message, type }
    });
    window.dispatchEvent(event);
};
