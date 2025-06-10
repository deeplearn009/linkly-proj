import {createSlice} from "@reduxjs/toolkit";

const initialState = {themeModalIsOpen: false, editProfileModal: false, editPostModal: false, editPostId: "", theme: JSON.parse(localStorage.getItem("theme")) || {primaryColor: "", backgroundColor: ""}};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openThemeModal: (state, action) => {
            state.themeModalIsOpen = true;
        },
        closeThemeModal: (state, action) => {
            state.themeModalIsOpen = false;
        },
        changeTheme: (state, action) => {
            state.theme = action.payload;
        },
        openEditProfileModal: (state, action) => {
            state.editProfileModalOpen = true;
        },
        closeEditProfileModal: (state, action) => {
            state.editProfileModalOpen = false;
        },
        openEditPostModal: (state, action) => {
            state.editPostModalOpen = true;
            state.editPostId = action.payload;
        },
        closeEditPostModal: (state, action) => {
            state.editPostModalOpen = false;
        }
    }
})

export const uiSliceActions = uiSlice.actions;

export default uiSlice;