import { createSlice } from "@reduxjs/toolkit";

const logSlice = createSlice({
    name: "log",
    initialState: {
        currentPage: 'signin',
    },
    reducers: {
        setPage: (state, action) => {
            state.currentPage = action.payload;
        },
    },
});

export const { setPage } = logSlice.actions;

export default logSlice.reducer;