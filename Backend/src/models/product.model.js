import mongoose from "mongoose";

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
        amount: {
            type: Number,
        },
        currency: {
            type: String,
            enum: ["INR", "USD", "EUR", "GBP", "JPY", "CAD"],
            default: "INR",
            toUpperCase: true,
        }
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
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            enum: ["INR", "USD", "EUR", "GBP", "JPY", "CAD"],
            default: "INR",
            toUpperCase: true,
        }
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
