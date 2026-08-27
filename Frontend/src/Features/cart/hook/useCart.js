import { useDispatch, useSelector } from "react-redux";
import { addToCartAPI, removeFromCartAPI, getCartAPI } from "../service/cart.api";
import { setItems, setLoading, setError } from "../state/cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items);
    const totalItems = useSelector((state) => state.cart.totalItems);
    const isLoading = useSelector((state) => state.cart.isLoading);
    const error = useSelector((state) => state.cart.error);

    const handleAddToCart = async (productId, variantId = "default", quantity = 1) => {
        try {
            dispatch(setLoading(true));
            const response = await addToCartAPI(productId, variantId, quantity);
            const cartData = await getCartAPI();
            dispatch(setItems(cartData.cart?.items || cartData.items || []));
            return response;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to add to cart";
            dispatch(setError(errorMsg));
            throw new Error(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleRemoveFromCart = async (itemId, productId, variantId) => {
        try {
            dispatch(setLoading(true));
            const response = await removeFromCartAPI(itemId, productId, variantId);
            const cartData = await getCartAPI();
            dispatch(setItems(cartData.cart?.items || cartData.items || []));
            return response;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to remove from cart";
            dispatch(setError(errorMsg));
            throw new Error(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleGetCart = async () => {
        try {
            dispatch(setLoading(true));
            const response = await getCartAPI();
            dispatch(setItems(response.cart?.items || response.items || []));
            return response;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to fetch cart";
            dispatch(setError(errorMsg));
            throw new Error(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    };

    return {
        cartItems,
        totalItems,
        isLoading,
        error,
        handleAddToCart,
        handleRemoveFromCart,
        handleGetCart
    };
};