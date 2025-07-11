import { configureStore } from '@reduxjs/toolkit';
import userReducer from "./userSlice";
import logReducer from "./logSlice";

const appStore=configureStore({
    reducer:{
        user:userReducer,
        log:logReducer,
    }
})

export default appStore;
