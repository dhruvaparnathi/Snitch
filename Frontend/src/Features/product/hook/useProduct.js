import { useDispatch, useSelector } from "react-redux";
import { createProductApi, getAllProductsApi, getSellerProductsApi, getSingleProductApi } from "../service/product.api";
import { setLoading, setError, setProducts, addProduct } from "../state/product.slice";

export const useProduct = () => {
    const dispatch = useDispatch();

    const { products, loading, error } = useSelector((state) => state.product);

    const handleCreateProduct = async (productData) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            let formData;
            if (productData instanceof FormData) {
                formData = productData;
            } else {
                formData = new FormData();
                const { name, description, priceAmount, priceCurrency, stockQuantity, images } = productData;
                
                formData.append("name", name || "");
                formData.append("description", description || "");
                formData.append("priceAmount", priceAmount !== undefined ? priceAmount : "");
                formData.append("priceCurrency", priceCurrency || "INR");
                formData.append("stockQuantity", stockQuantity !== undefined ? stockQuantity : "");

                if (images && images.length > 0) {
                    Array.from(images).forEach((file) => {
                        formData.append("images", file);
                    });
                }

                if (productData.variants) {
                    formData.append("variants", JSON.stringify(productData.variants));
                }
            }

            const response = await createProductApi(formData);
            if (response && response.product) {
                dispatch(addProduct(response.product));
            }
            return response;
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                (err.response?.data?.errors ? err.response.data.errors.map((e) => e.msg).join(", ") : null) ||
                err.message ||
                "Failed to create product";
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleGetAllProducts = async () => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const response = await getAllProductsApi();
            dispatch(setProducts(response.products || []));
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch products";
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleGetSellerProducts = async () => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const response = await getSellerProductsApi();
            dispatch(setProducts(response.products || []));
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch products";
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleGetSingleProduct = async (id) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const response = await getSingleProductApi(id);
            return response;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch product";
            dispatch(setError(errorMessage));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    };

    return { products, loading, error, handleCreateProduct, handleGetAllProducts, handleGetSellerProducts, handleGetSingleProduct };
};
