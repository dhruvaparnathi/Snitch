import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Features/auth/state/auth.slice.js";
import productReducer from "../Features/product/state/product.slice.js";
import cartReducer from "../Features/cart/state/cart.slice.js";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});