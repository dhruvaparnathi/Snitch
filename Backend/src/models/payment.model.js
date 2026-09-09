import mongoose, { Mongoose } from "mongoose";
import priceSchema from "./price.schema.js";

const paymentSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ["pending","paid", "failed"],
        required: true,
    },
    price: {
        type: priceSchema,
        required: true,
    },
    razorpay: {
        orderId: {
            type: String,
        },
        paymentId: {
            type: String,
        },
        signature: {
            type: String,
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderItems: [
        {
            title: {
                type: String,
                required: true,
            },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            variantId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Variant",
            },
            quantity: {
                type: Number,
            },
            images: [{
                url: String
            }],
            price: {
                type: priceSchema,
            },
            
        },
    ],
    
});

const paymentModel = mongoose.model("payment", paymentSchema);

export default paymentModel;