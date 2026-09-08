import Razorpay from "razorpay";
import config from "../config/config.js";

const razorpayInstance = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
});

export const createOrder = async ({ amount, currency }) => {
    const options = {
        amount: amount * 100,
        currency: currency,
        receipt: `order_${Date.now()}`,
        payment_capture: 1,
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
}