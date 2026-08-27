import productModel from "../models/product.model.js";

export const stockOfVariant = async (productId, variantId) => {
    try {
        const product = await productModel.findById(productId);
        if (!product) return 0;

        if (variantId && variantId !== "default" && Array.isArray(product.variants)) {
            const variant = product.variants.find(
                (v) => (v._id && v._id.toString() === variantId.toString()) || (v.id && v.id.toString() === variantId.toString())
            );
            if (variant && variant.stock !== undefined) {
                return variant.stock;
            }
        }

        return product.stock !== undefined ? product.stock : 0;
    } catch (err) {
        return 0;
    }
};
