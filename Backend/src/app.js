import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import config from "./config/config.js";

const app = express();

if(config.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import authRouter from "./routes/auth.route.js";

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

export default app;
