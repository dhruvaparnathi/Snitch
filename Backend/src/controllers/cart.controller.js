import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import mongoose from "mongoose";
import { stockOfVariant } from "../dao/product.dao.js";
import { getCartDetails } from "../dao/cart.dao.js";
import { createOrder } from "../services/payment.service.js";
import paymentModel from "../models/payment.model.js";
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils.js';
import config from "../config/config.js";

export const addToCartController = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const quantity = Number(req.body?.quantity || req.query?.quantity || req.params?.quantity || 1);
        const userId = req.user._id;

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        // Strictly enforce that sellers cannot buy / add to cart their own listed products
        const sellerId = product.seller?._id?.toString() || product.seller?.toString();
        if (sellerId && sellerId === userId.toString()) {
            return res.status(400).json({
                message: "You cannot purchase your own listed product.",
                success: false
            });
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
        let cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            cart = await cartModel.create({ user: userId, items: [] });
        }

        cart = await getCartDetails(userId);

        return res.status(200).json({ message: "Cart fetched successfully", cart: cart || { items: [] } });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const createCartOrderController = async (req, res) => {
    const cart = await getCartDetails(req.user._id);
    if (!cart) {
        return res.status(400).json({ message: "Cart is empty", success: false });
    }

    const orderData = await createOrder({
        amount: cart.total,
        currency: "INR",
    });

    const payment = await paymentModel.create({
        status: "pending",
        user: req.user._id,
        razorpay: {
            orderId: orderData.id,
        },
        price: {
            amount: cart.total,
            currency: cart.currency,
        },
        orderItems: cart.items.map((item) => {
            const validVariantId = (item.item.variant && mongoose.Types.ObjectId.isValid(item.item.variant)) ? item.item.variant : undefined;

            let itemImages = item.item.product.images || item.item.product.Images || [];
            const matchedVariant = item.item.product.variants;
            if (validVariantId && matchedVariant) {
                if (Array.isArray(matchedVariant.images) && matchedVariant.images.length > 0) {
                    itemImages = matchedVariant.images;
                } else if (Array.isArray(matchedVariant.Images) && matchedVariant.Images.length > 0) {
                    itemImages = matchedVariant.Images;
                }
            }

            return {
                title: item.item.product.title,
                productId: item.item.product._id,
                variantId: validVariantId,
                variant: item.item.variant,
                quantity: item.item.quantity,
                images: itemImages,
                price: {
                    amount: item.item.price.amount,
                    currency: item.item.price.currency,
                },
            };
        }),
    });

    return res.status(200).json({ message: "Order created successfully", success: true, order: orderData, payment });
};

export const verifyCartOrderController = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = req.body;

    const payment = await paymentModel.findOne({
        'razorpay.orderId': razorpay_order_id,
        status: "pending",
    });
    

    if (!payment) {
        return res.status(400).json({ message: "Payment details not found", success: false });
    }

    const isPaymentValid = validatePaymentVerification({
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
    }, razorpay_signature, config.RAZORPAY_KEY_SECRET);

    if (!isPaymentValid) {
        payment.status = "failed";
        await payment.save();
        return res.status(400).json({ message: "Invalid payment signature", success: false });
    }

    payment.status = "paid";
    payment.razorpay.paymentId = razorpay_payment_id;
    payment.razorpay.signature = razorpay_signature;
    await payment.save();

    // Reduce stock for each product/variant in payment.orderItems
    for (const item of payment.orderItems) {
        const prodId = item.productId || item._id;
        const product = await productModel.findById(prodId);
        if (!product) continue;

        const qty = Number(item.quantity) || 1;
        const varId = item.variantId || item.variant;

        if (varId && Array.isArray(product.variants) && product.variants.length > 0) {
            const targetVar = String(varId);
            let variant = null;
            if (mongoose.Types.ObjectId.isValid(varId) && typeof product.variants.id === "function") {
                try {
                    variant = product.variants.id(varId);
                } catch (e) {}
            }
            if (!variant) {
                variant = product.variants.find((v, idx) => (v._id && String(v._id) === targetVar) || (v.id && String(v.id) === targetVar) || String(idx) === targetVar);
            }

            if (variant) {
                variant.stock = Math.max(0, (variant.stock || 0) - qty);
            }
        }

        product.stock = Math.max(0, (product.stock || 0) - qty);
        await product.save();
    }

    const cart = await cartModel.findOneAndDelete({ user: req.user._id });

    return res.status(200).json({ message: "Payment verified successfully", success: true, payment });
};

export const getOrderDetailsController = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required", success: false });
        }

        const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
        const queryConditions = [{ 'razorpay.orderId': orderId }];
        if (isObjectId) {
            queryConditions.push({ _id: orderId });
        }

        const payment = await paymentModel.findOne({
            $or: queryConditions,
            user: req.user._id,
        }).populate("orderItems.productId");

        if (!payment) {
            return res.status(404).json({ message: "Order not found", success: false });
        }

        return res.status(200).json({ message: "Order details fetched successfully", success: true, order: payment });
    } catch (err) {
        return res.status(500).json({ message: err.message || "Failed to fetch order details", success: false });
    }
};

export const getUserOrdersController = async (req, res) => {
    try {
        const orders = await paymentModel.find({
            user: req.user._id,
        })
        .populate("orderItems.productId")
        .sort({ createdAt: -1, _id: -1 });

        return res.status(200).json({
            message: "User orders fetched successfully",
            success: true,
            orders,
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to fetch orders",
            success: false,
        });
    }
};