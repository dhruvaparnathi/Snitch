import { createBrowserRouter } from "react-router";
import App from "./App.jsx";
import Register from "../Features/auth/pages/Register.jsx";
import Login from "../Features/auth/pages/Login.jsx";
import CreateProduct from "../Features/product/pages/createProduct.jsx";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/create-product",
        element: <CreateProduct />
    }

])