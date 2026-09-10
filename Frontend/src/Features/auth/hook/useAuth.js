import { useDispatch } from "react-redux";
import { registerApi, loginApi, meApi, logoutApi } from "../service/auth.api";
import { setUser, setLoading, setInitialized, setError } from "../state/auth.slice";
import { setCart } from "../../cart/state/cart.slice";

export const useAuth = () => {
    const dispatch = useDispatch();
    
    const handleRegister = async ({ email, mobile, fullName, password, role }) => {
        try {
            dispatch(setLoading(true));
            const response = await registerApi({ email, mobile, fullName, password, role });
            dispatch(setUser(response.user));
            dispatch(setInitialized(true));
            return response;
        } catch (error) {
            dispatch(setError(error.message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    const handleLogin = async ({ email, password }) => {
        try {
            dispatch(setLoading(true));
            const response = await loginApi({ email, password });
            dispatch(setUser(response.user));
            dispatch(setInitialized(true));
            return response;
        } catch (error) {
            dispatch(setError(error.message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    const apiUrl = import.meta.env.VITE_API_URL || "https://snitch-i93v.onrender.com";
    const handleGoogleAuth = () => {
        const returnTo = window.location.origin;
        window.location.href = `${apiUrl}/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
    }

    const handleMe = async () => {
        try {
            dispatch(setLoading(true));
            const response = await meApi();
            dispatch(setUser(response.user));
            return response;
        } catch (error) {
            dispatch(setError(error.message));
            dispatch(setUser(null));
            throw error;
        } finally {
            dispatch(setLoading(false));
            dispatch(setInitialized(true));
        }
    }

    const handleLogout = async () => {
        try {
            dispatch(setLoading(true));
            await logoutApi().catch(() => {});
        } finally {
            // Enterprise-grade cleanup: clear all credentials and cached session stores
            dispatch(setUser(null));
            dispatch(setCart(null));
            dispatch(setError(null));
            dispatch(setInitialized(true));
            sessionStorage.clear();
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGoogleAuth,
        handleMe,
        handleLogout
    }
}