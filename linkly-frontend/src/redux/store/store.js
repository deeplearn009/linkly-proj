import {configureStore} from "@reduxjs/toolkit";
import uiSlice from "../ui-slice.js";
import userSlice from "../user-slice.js";
import notificationReducer from "../notification-slice.js";


const store = configureStore({
    reducer: {
        ui: uiSlice.reducer,
        user: userSlice.reducer,
        notification: notificationReducer,
    }
})

export default store