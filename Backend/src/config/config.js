import dotenv from "dotenv";
dotenv.config();

const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
}

if (!config.MONGO_URI || !config.JWT_SECRET || !config.NODE_ENV || !config.PORT || !config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET || !config.GOOGLE_CALLBACK_URL || !config.IMAGEKIT_PRIVATE_KEY || !config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    throw new Error("Please define all the environment variables");
}

export default config;
