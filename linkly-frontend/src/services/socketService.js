import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(userId) {
        if (this.socket) {
            this.disconnect();
        }

        try {
            const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:6060';
            const cleanUrl = socketUrl.replace(/\/$/, '').replace(/\/socket\.io.*$/, '').replace(/\/api.*$/, '');
            
            this.socket = io(cleanUrl, {
                query: { userId: userId },
                transports: ['websocket', 'polling'],
                timeout: 20000,
            });

            // Set up connection event handlers
            this.socket.on('connect', () => {
                this.notifyListeners('connection', { connected: true, socketId: this.socket.id });
            });

            this.socket.on('disconnect', (reason) => {
                this.notifyListeners('connection', { connected: false, reason });
            });

            this.socket.on('connect_error', (error) => {
                this.notifyListeners('connection', { connected: false, error });
            });

            this.socket.on('reconnect', (attemptNumber) => {
                this.notifyListeners('connection', { connected: true, reconnected: true });
            });

            this.socket.on('reconnect_error', (error) => {
                // Silent reconnection error handling
            });

            // Set up message handlers
            this.socket.on('getOnlineUsers', (onlineUsers) => {
                this.notifyListeners('onlineUsers', onlineUsers);
            });

            this.socket.on('newMessage', (message) => {
                this.notifyListeners('newMessage', message);
            });

            this.socket.on('test', (data) => {
                this.notifyListeners('test', data);
            });

            // Listen for notification events
            this.socket.on('notification', (notification) => {
                this.notifyListeners('notification', notification);
                // Browser push notification
                if (window.Notification && Notification.permission === 'granted') {
                    let body = '';
                    if (notification.type === 'like') body = 'Someone liked your post.';
                    else if (notification.type === 'comment') body = 'Someone commented on your post.';
                    else if (notification.type === 'follow') body = 'Someone followed you.';
                    else if (notification.type === 'message') body = 'New message received.';
                    else if (notification.type === 'admin') body = 'Admin notification.';
                    new Notification('Linkly', { body });
                }
            });

        } catch (error) {
            this.notifyListeners('connection', { connected: false, error });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.notifyListeners('connection', { connected: false });
        }
    }

    // Method to add event listeners
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    // Method to remove event listeners
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // Method to emit events
    emit(event, data) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        }
    }

    // Method to get socket instance
    getSocket() {
        return this.socket;
    }

    // Method to check if connected
    isConnected() {
        return this.socket && this.socket.connected;
    }

    // Notify all listeners for an event
    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in socket listener:', error);
                }
            });
        }
    }

    // Clear all listeners
    clearListeners() {
        this.listeners.clear();
    }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService; 