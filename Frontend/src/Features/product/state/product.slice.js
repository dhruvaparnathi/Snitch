import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: "product",
    initialState: {
        products: [],
        loading: false,
        error: null,
    },
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        addProduct: (state, action) => {
            state.products.push(action.payload);
        },
        removeProduct: (state, action) => {
            const targetId = action.payload;
            state.products = state.products.filter(p => (p._id || p.id)?.toString() !== targetId?.toString());
        }
    },
});

export const { setProducts, setLoading, setError, addProduct, removeProduct } = productSlice.actions;

export default productSlice.reducer;