import { createBrowserRouter } from "react-router";
import App from "./App.jsx";
import Register from "../Features/auth/pages/Register.jsx";
import Login from "../Features/auth/pages/Login.jsx";
import Dashboard from "../Features/product/pages/Dashboard.jsx";
import ProductDetails from "../Features/product/pages/ProductDetails.jsx";
import Protected from "../Features/auth/pages/Protected.jsx";
import CreateProduct from "../Features/product/pages/CreateProduct.jsx";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/product/:id",
    element: <ProductDetails />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/seller",
    children: [
      {
        path: "dashboard",
        element: <Protected role="seller">
          <Dashboard />
        </Protected>,
      },
      {
        path: "create-product",
        element: <Protected role="seller">
          <CreateProduct />
        </Protected>,
      },
    ],
  },
]);
