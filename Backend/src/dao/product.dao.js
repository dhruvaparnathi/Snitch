import productModel from "../models/product.model.js";

export const stockOfVariant = async (productId, variantId) => {
    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    })

    const stock = product.variants.find(variant => variant._id.toString() === variantId.toString()).stock;

    if (!stock) {
        return null;
    }

    return stock;
}
