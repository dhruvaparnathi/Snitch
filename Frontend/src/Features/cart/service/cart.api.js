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

export const createOrderAPI = async () => {
    const response = await cartApiInstance.post("/payment/order/create");
    return response.data;
};

export const paymentVerificationAPI = async (response) => {
    const verificationResponse = await cartApiInstance.post("/payment/order/verify", {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature
    });
    return verificationResponse.data;
};

export const getOrderDetailsAPI = async (orderId) => {
    const response = await cartApiInstance.get(`/order/${orderId}`);
    return response.data;
};

export const getUserOrdersAPI = async () => {
    const response = await cartApiInstance.get("/orders");
    return response.data;
};