import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { useAuth } from "../hook/useAuth.js";
import { useEffect } from "react";
import SellerLoader from "../../../Components/loaders/SellerLoader.jsx";
import BuyerLoader from "../../../Components/loaders/BuyerLoader.jsx";

function Protected({ children, role = "seller" }) {
  const { handleMe } = useAuth();

  useEffect(() => {
    handleMe();
  }, []);

  const user = useSelector((state) => state.auth.user);
  const initialized = useSelector((state) => state.auth.initialized);

  if (!initialized) {
    if (role === "seller") {
      return <SellerLoader subtitle="SELLER GATEWAY AUTHENTICATION" duration={1.2} />;
    }
    return <BuyerLoader duration={1.2} />;
  }

  if (user && user.role === role) {
    return children;
  } else {
    return <Navigate to="/" replace />;
  }
}

export default Protected;