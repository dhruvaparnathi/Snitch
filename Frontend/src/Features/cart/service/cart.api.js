import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: `http://localhost:3000/api/cart`,
    withCredentials: true,
});

export const addToCartAPI = async (productId, variantId = "default", quantity = 1) => {
    const url = variantId && variantId !== "default"
        ? `add/${productId}/${variantId}?quantity=${quantity}`
        : `add/${productId}?quantity=${quantity}`;
    const response = await cartApiInstance.post(url, {
        productId,
        variantId,
        quantity: Number(quantity) || 1
    });
    return response.data;
};

export const removeFromCartAPI = async (itemId, productId, variantId) => {
    let url = "";
    if (itemId) {
        url = `item/${itemId}`;
    } else if (productId && variantId && variantId !== "default") {
        url = `remove/${productId}/${variantId}`;
    } else if (productId) {
        url = `remove/${productId}`;
    }
    const response = await cartApiInstance.delete(url);
    return response.data;
};

export const getCartAPI = async () => {
    const response = await cartApiInstance.get("/");
    return response.data;
};