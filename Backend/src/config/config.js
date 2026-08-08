import dotenv from "dotenv";
dotenv.config();

const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
}

if(!config.MONGO_URI || !config.JWT_SECRET || !config.NODE_ENV || !config.PORT) {
    throw new Error("Please define all the environment variables");
}

export default config;
