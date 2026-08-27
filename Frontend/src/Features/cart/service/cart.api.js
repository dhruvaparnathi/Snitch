import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: `http://localhost:3000/api/cart`,
    withCredentials: true,
});

export const addToCartAPI = async (productId, variantId, quantity) => {
    const response = await cartApiInstance.post(`add/${productId}/${variantId}?quantity=${quantity}`);
    return response.data;
};

export const getCartAPI = async () => {
    const response = await cartApiInstance.get("/");
    return response.data;
};