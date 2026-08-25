import mongoose from "mongoose";
import priceSchema from "./price.schema";

const variantSchema = new mongoose.Schema({
    images: [{
        url: {
            type: String,
        },
        alt: {
            type: String,
        }
    }],
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
}, { _id: false });

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
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
    Images: [
        {
            url: {
                type: String,
                required: true,
            },
            alt: {
                type: String,
                required: true,
            },
        }
    ]
}, { timestamps: true });

const productModel = mongoose.model("Product", productSchema);
export default productModel;
