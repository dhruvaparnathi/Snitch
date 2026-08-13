import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "http://localhost:3000/api/product",
    withCredentials: true,
});

export const createProductApi = async (productData) => {
    const response = await productApiInstance.post("/create", productData);
    return response.data;
};

export const getAllProductsApi = async () => {
    const response = await productApiInstance.get("/");
    return response.data;
};