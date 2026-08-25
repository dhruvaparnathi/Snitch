import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
    {
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
    }
);

export default priceSchema;