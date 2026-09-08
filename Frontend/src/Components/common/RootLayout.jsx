import { useEffect } from "react";
import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import { useAuth } from "../../Features/auth/hook/useAuth.js";
import { useCart } from "../../Features/cart/hook/useCart.js";

export default function RootLayout() {
  const { handleMe } = useAuth();
  const { handleGetCart } = useCart();
  const user = useSelector((state) => state.auth.user);
  const initialized = useSelector((state) => state.auth.initialized);

  useEffect(() => {
    if (!initialized) {
      handleMe().catch(() => {});
    }
  }, [initialized]);

  useEffect(() => {
    if (user) {
      handleGetCart().catch(() => {});
    }
  }, [user]);

  return <Outlet />;
}
