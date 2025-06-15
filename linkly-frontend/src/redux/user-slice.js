import {createSlice} from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        currentUser: JSON.parse(localStorage.getItem("currentUser")) || null,
        socket: null,
        onlineUsers: [],
        isAuthenticated: !!JSON.parse(localStorage.getItem("currentUser")),
        isAdmin: JSON.parse(localStorage.getItem("currentUser"))?.role === 'admin',
        loading: false,
        error: null
    },
    reducers: {
        changeCurrentUser: (state, action) => {
            state.currentUser = action.payload;
            state.isAuthenticated = !!action.payload;
            state.isAdmin = action.payload?.role === 'admin';
            
            if (action.payload) {
                localStorage.setItem("currentUser", JSON.stringify(action.payload));
            } else {
                localStorage.removeItem("currentUser");
            }
        },
        setSocket: (state, action) => {
            state.socket = action.payload;
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        logout: (state) => {
            state.currentUser = null;
            state.isAuthenticated = false;
            state.isAdmin = false;
            state.socket = null;
            state.onlineUsers = [];
            state.error = null;
            localStorage.removeItem("currentUser");
        }
    }
})

export const userActions = userSlice.actions;

export default userSlice;