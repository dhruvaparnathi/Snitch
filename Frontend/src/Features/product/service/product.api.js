import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "http://localhost:3000/api/product",
    withCredentials: true,
});

export const createProductApi = async (productData) => {
    const response = await productApiInstance.post("/seller/create", productData);
    return response.data;
};

export const getAllProductsApi = async () => {
    const response = await productApiInstance.get("/seller");
    return response.data;
};

export const getSellerProductsApi = async () => {
    const response = await productApiInstance.get("/seller/myshop");
    return response.data;
};

export const getSingleProductApi = async (id) => {
    const response = await productApiInstance.get(`/${id}`);
    return response.data;
};