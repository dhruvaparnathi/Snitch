import { useDispatch, useSelector } from "react-redux";
import { addToCartAPI, getCartAPI } from "../service/cart.api";
import { setItems, addItem, setLoading, setError } from "../state/cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector(state => state.cart.items);
    const isLoading = useSelector(state => state.cart.isLoading);
    const error = useSelector(state => state.cart.error);

    const handleAddToCart = async (productId, variantId, quantity) => {
        try {
            dispatch(setLoading(true));
            const response = await addToCartAPI(productId, variantId, quantity);
            dispatch(setItems(response));
            return response;
        } catch (error) {
            dispatch(setError(error.message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    const handleGetCart = async () => {
        try {
            dispatch(setLoading(true));
            const response = await getCartAPI();
            dispatch(setItems(response));
            return response;
        } catch (error) {
            dispatch(setError(error.message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        cartItems,
        isLoading,
        error,
        handleAddToCart,
        handleGetCart
    }
}