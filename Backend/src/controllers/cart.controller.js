import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";



export const addToCartController = async (req, res) => {
    try {
        const { productId, variantId, quantity } = req.params;
        const userId = req.user._id;

        const product = await productModel.findOne({
            _id: productId,
            "variants._id": variantId,
        })

        if (!product) {
            return res.status(404).json({ message: "Product or Variant not found" })
        }

        const cart = (await cartModel.findOne({ user: userId })) || (await cartModel.create({ user: userId }));
        const stock = await stockOfVariant(productId, variantId);

        const isProductAlreadyInCart = cart.items.some(item => item.product.toString() === productId.toString() && item.variant.toString() === variantId.toString());

        if (isProductAlreadyInCart) {
            const quantityInCart = cart.items.find(item => item.product.toString() === productId.toString() && item.variant.toString() === variantId.toString()).quantity;
            
            if (quantityInCart + quantity > stock) {
                return res.status(400).json({ message: `Only ${stock} are left in stock` });
            }

            await cartModel.findOneAndUpdate(
                { user: req.user._id, 'items.product': productId, 'items.variant': variantId },
                { $inc: { "items.$.quantity": quantity } },
                { new: true }
            )

            return res.status(200).json({ message: "Cart updated successfully", success: true });
        }

        if(quantity > stock){
            return res.status(400).json({ message: `Only ${stock} are left in stock`, success: false });
        }

        cart.items.push({
            product: productId,
            variant: variantId,
            quantity,
            price: {
                amount: variant.price.amount,
                currency: variant.price.currency
            }
        })

        await cart.save();

        return res.status(200).json({ message: "Product added to cart successfully", success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getCartController = async (req,res) => {
    try {
        const userId = req.user._id;
        const cart = await cartModel.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            await cartModel.create({ user: userId });
        }

        return res.status(200).json({ message: "Cart fetched successfully", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}