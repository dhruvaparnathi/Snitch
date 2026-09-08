import { useDispatch, useSelector } from "react-redux";
import { addToCartAPI, removeFromCartAPI, getCartAPI, createOrderAPI } from "../service/cart.api";
import { setCart, setLoading, setError } from "../state/cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart.cart);
    const rawItems = Array.isArray(cart?.items) ? cart.items : [];
    const cartItems = rawItems.map((entry) => (entry && entry.item ? { ...entry.item, itemPrice: entry.itemPrice } : entry));
    const totalItems = cart?.totalItems ?? cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
    const isLoading = useSelector((state) => state.cart.isLoading);
    const error = useSelector((state) => state.cart.error);

    const handleAddToCart = async (productId, variantId = "default", quantity = 1) => {
        try {
            dispatch(setLoading(true));
            const response = await addToCartAPI(productId, variantId, quantity);
            const cartData = await getCartAPI();
            dispatch(setCart(cartData.cart || cartData));
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
            dispatch(setCart(cartData.cart || cartData));
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
            dispatch(setCart(response.cart || response));
            return response;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to fetch cart";
            dispatch(setError(errorMsg));
            throw new Error(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleCreateOrder = async () => {
        try {
            dispatch(setLoading(true));
            const response = await createOrderAPI();
            return response;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to create order";
            dispatch(setError(errorMsg));
            throw new Error(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    };

    return {
        cart,
        cartItems,
        totalItems,
        isLoading,
        error,
        handleAddToCart,
        handleRemoveFromCart,
        handleGetCart,
        handleCreateOrder
    };
};