import mongoose from "mongoose";
import config from "./config.js";

const dbConnect = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("MongoDB connected successfully");
        try {
            await mongoose.connection.collection("users").dropIndex("mobile_1");
            console.log("Legacy mobile_1 index dropped successfully");
        } catch (e) {
            // Index already dropped or doesn't exist, safely ignore
        }
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default dbConnect;