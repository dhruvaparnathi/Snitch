import { createBrowserRouter } from "react-router";
import App from "./App.jsx";
import Register from "../Features/auth/pages/Register.jsx";
import Login from "../Features/auth/pages/Login.jsx";
import Dashboard from "../Features/product/pages/Dashboard.jsx";
import ProductDetails from "../Features/product/pages/ProductDetails.jsx";
import Protected from "../Features/auth/pages/Protected.jsx";
import CreateProduct from "../Features/product/pages/CreateProduct.jsx";
import EditProduct from "../Features/product/pages/EditProduct.jsx";
import Cart from "../Features/cart/pages/Cart.jsx";
import OrderSuccess from "../Features/cart/pages/OrderSuccess.jsx";
import OrderHistory from "../Features/cart/pages/OrderHistory.jsx";

import RootLayout from "../Components/common/RootLayout.jsx";

export const routes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/order-success",
        element: <OrderSuccess />,
      },
      {
        path: "/orders",
        element: <OrderHistory />,
      },
      {
        path: "/order-history",
        element: <OrderHistory />,
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
          {
            path: "edit-product/:id",
            element: <Protected role="seller">
              <EditProduct />
            </Protected>,
          },
        ],
      },
    ],
  },
]);
