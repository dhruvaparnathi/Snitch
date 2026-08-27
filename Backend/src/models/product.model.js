import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const imageSubSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    alt: {
        type: String,
        default: "Product image",
    }
});

const variantSchema = new mongoose.Schema({
    images: [imageSubSchema],
    stock: {
        type: Number,
        default: 0,
    },
    attributes: {
        type: Map,
        of: String
    },
    prices: {
        type: priceSchema
    }
});

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: "Living Units",
    },
    price: {
        type: priceSchema,
        required: true
    },
    variants: [variantSchema],
    stock: {
        type: Number,
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    Images: [imageSubSchema],
    images: [imageSubSchema]
}, { timestamps: true });

const productModel = mongoose.model("Product", productSchema);
export default productModel;
