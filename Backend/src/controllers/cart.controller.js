import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";

export const addToCartController = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const quantity = Number(req.body?.quantity || req.query?.quantity || req.params?.quantity || 1);
        const userId = req.user._id;

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        let variant = null;
        let stock = product.stock || 0;
        let itemPrice = product.price;

        const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

        // Strictly enforce that if a product has variants, the user MUST add a specific variant
        if (hasVariants) {
            if (!variantId || variantId === "default") {
                return res.status(400).json({
                    message: "This product has variants. Please select a specific variant.",
                    success: false
                });
            }

            const targetId = String(variantId);

            // 1. Try Mongoose subdocument .id() lookup
            if (product.variants && typeof product.variants.id === "function") {
                try {
                    variant = product.variants.id(targetId);
                } catch (e) {}
            }

            // 2. Try matching by string _id or id
            if (!variant && Array.isArray(product.variants)) {
                variant = product.variants.find(
                    (v) => (v._id && String(v._id) === targetId) || (v.id && String(v.id) === targetId)
                );
            }

            // 3. Try matching by index or variant-idx string
            if (!variant && Array.isArray(product.variants)) {
                const cleanIdx = targetId.startsWith("variant-") ? targetId.replace("variant-", "") : targetId;
                const idx = Number(cleanIdx);
                if (!isNaN(idx) && idx >= 0 && idx < product.variants.length) {
                    variant = product.variants[idx];
                }
            }

            if (!variant) {
                return res.status(400).json({
                    message: "Selected variant not found for this product.",
                    success: false
                });
            }

            stock = variant.stock !== undefined ? variant.stock : stock;
            if (variant.prices && variant.prices.amount !== undefined) {
                itemPrice = variant.prices;
            } else if (variant.price && variant.price.amount !== undefined) {
                itemPrice = variant.price;
            }
        }

        let cart = (await cartModel.findOne({ user: userId })) || (await cartModel.create({ user: userId, items: [] }));

        const targetVarId = variant ? (variant._id?.toString() || variant.id?.toString() || String(variantId)) : null;

        const matchesItem = (item) => {
            const itemProdId = item.product?._id?.toString() || item.product?.toString();
            const itemVarId = item.variant?._id?.toString() || item.variant?.toString() || (item.variant !== undefined && item.variant !== null ? String(item.variant) : null);
            const currentItemVar = itemVarId && itemVarId !== "default" ? itemVarId : null;
            return itemProdId === productId.toString() && currentItemVar === targetVarId;
        };

        const existingItem = cart.items.find(matchesItem);

        if (existingItem) {
            const quantityInCart = existingItem.quantity || 0;
            
            if (quantityInCart + quantity > stock) {
                return res.status(400).json({ message: `Only ${stock} are left in stock for this selection`, success: false });
            }

            existingItem.quantity += quantity;
            await cart.save();
            const updatedCart = await cartModel.findOne({ user: userId }).populate("items.product");
            return res.status(200).json({ message: "Cart updated successfully", success: true, cart: updatedCart });
        }

        if (quantity > stock) {
            return res.status(400).json({ message: `Only ${stock} are left in stock`, success: false });
        }

        cart.items.push({
            product: productId,
            variant: targetVarId,
            quantity,
            price: {
                amount: itemPrice.amount,
                currency: itemPrice.currency || "INR"
            }
        });

        await cart.save();
        const updatedCart = await cartModel.findOne({ user: userId }).populate("items.product");

        return res.status(200).json({ message: "Product added to cart successfully", success: true, cart: updatedCart });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const removeFromCartController = async (req, res) => {
    try {
        const { itemId, productId, variantId } = req.params;
        const userId = req.user._id;

        const cart = await cartModel.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found", success: false });
        }

        if (itemId) {
            cart.items = cart.items.filter((item) => item._id?.toString() !== itemId.toString());
        } else if (productId) {
            const targetVarId = variantId && variantId !== "default" ? String(variantId) : null;
            cart.items = cart.items.filter((item) => {
                const itemProdId = item.product?._id?.toString() || item.product?.toString();
                const itemVarId = item.variant?._id?.toString() || item.variant?.toString() || (item.variant !== undefined && item.variant !== null ? String(item.variant) : null);
                const currentItemVar = itemVarId && itemVarId !== "default" ? itemVarId : null;
                return !(itemProdId === productId.toString() && currentItemVar === targetVarId);
            });
        }

        await cart.save();
        const updatedCart = await cartModel.findOne({ user: userId }).populate("items.product");
        return res.status(200).json({ message: "Item removed from cart successfully", success: true, cart: updatedCart });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const getCartController = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await cartModel.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            await cartModel.create({ user: userId, items: [] });
        }

        return res.status(200).json({ message: "Cart fetched successfully", cart: cart || { items: [] } });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};