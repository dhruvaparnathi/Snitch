import mongoose from "mongoose";
import config from "./config.js";

const dbConnect = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default dbConnect;