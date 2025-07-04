import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    setNotifications(state, action) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    addNotification(state, action) {
      state.notifications = [action.payload, ...state.notifications];
      state.unreadCount += 1;
    },
    markAsRead(state, action) {
      const id = action.payload;
      state.notifications = state.notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      );
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
    markAllAsRead(state) {
      state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
    deleteNotification(state, action) {
      const id = action.payload;
      state.notifications = state.notifications.filter(n => n._id !== id);
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const notificationActions = notificationSlice.actions;
export default notificationSlice.reducer; 