import { useDispatch } from "react-redux";
import { registerApi, loginApi } from "../service/auth.api";
import { setUser, setLoading, setError } from "../state/auth.slice";

export const useAuth = () => {
    const dispatch = useDispatch();
    
    const handleRegister = async ({ email, mobile, fullName, password, role }) => {
        try {
            dispatch(setLoading(true));
            const response = await registerApi({ email, mobile, fullName, password, role });
            dispatch(setUser(response.user));
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
            return response;
        } catch (error) {
            dispatch(setError(error.message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin,
    }
}