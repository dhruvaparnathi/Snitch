import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        totalItems: 0,
        isLoading: false,
        error: null,
    },
    reducers: {
        setItems: (state, action) => {
            const raw = Array.isArray(action.payload)
                ? action.payload
                : (action.payload?.cart?.items || action.payload?.items || []);
            state.items = raw;
            state.totalItems = raw.reduce((total, item) => total + (item.quantity || 1), 0);
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
            state.totalItems += (action.payload?.quantity || 1);
        },
        removeItem: (state, action) => {
            const itemId = action.payload;
            state.items = state.items.filter((item) => item._id !== itemId);
            state.totalItems = state.items.reduce((total, item) => total + (item.quantity || 1), 0);
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setItems, addItem, removeItem, setLoading, setError } = cartSlice.actions;

export default cartSlice.reducer;