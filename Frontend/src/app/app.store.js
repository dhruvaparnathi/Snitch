import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Features/auth/state/auth.slice.js";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});