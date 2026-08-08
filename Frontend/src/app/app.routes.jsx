import { createBrowserRouter } from "react-router";
import App from "./App.jsx";
import Register from "../Features/auth/pages/Register.jsx";
import Login from "../Features/auth/pages/Login.jsx";

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
    }

])