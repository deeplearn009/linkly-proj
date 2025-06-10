import {configureStore} from "@reduxjs/toolkit";
import uiSlice from "../ui-slice.js";
import userSlice from "../user-slice.js";


const store = configureStore({
    reducer: {
        ui: uiSlice.reducer,
        user: userSlice.reducer,
    }
})

export default store