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
            state.items = action.payload;
            state.totalItems = action.payload.reduce((total, item) => total + item.quantity, 0);
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
            state.totalItems++;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setItems, addItem, setLoading, setError } = cartSlice.actions;

export default cartSlice.reducer;