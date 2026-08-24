import axios from "axios";

const authApiInstance = axios.create({
    baseURL: "http://localhost:3000/api/auth",
    withCredentials: true,
});

export const registerApi = async ({ email, mobile, fullName, password, role }) => {
    const response = await authApiInstance.post("/register", {
        email,
        mobile,
        fullName,
        password,
        role
    });
    return response.data;
};

export const loginApi = async ({ email, password }) => {
    const response = await authApiInstance.post("/login", {
        email,
        password
    });
    return response.data;
};

export const meApi = async () => {
    const response = await authApiInstance.get("/me");
    return response.data;
};