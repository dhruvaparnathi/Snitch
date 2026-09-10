import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "./models/user.model.js";

const app = express();

if (config.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://snitch-cart.vercel.app",
    config.FRONTEND_URL,
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app") ||
            /^https:\/\/.*\.vercel\.app$/.test(origin) ||
            origin.includes("localhost")
        ) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
}));

// Passport Setup
app.use(passport.initialize());

const getGoogleCallbackURL = () => {
    if (process.env.RENDER_EXTERNAL_URL) {
        return `${process.env.RENDER_EXTERNAL_URL}/api/auth/google/callback`;
    }
    if (process.env.GOOGLE_CALLBACK_URL) {
        if ((process.env.NODE_ENV === "production" || process.env.RENDER) && process.env.GOOGLE_CALLBACK_URL.includes("localhost")) {
            return "https://snitch-i93v.onrender.com/api/auth/google/callback";
        }
        return process.env.GOOGLE_CALLBACK_URL;
    }
    if (process.env.NODE_ENV === "production" || process.env.RENDER) {
        return "https://snitch-i93v.onrender.com/api/auth/google/callback";
    }
    return "/api/auth/google/callback";
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID_PLACEHOLDER",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET_PLACEHOLDER",
    callbackURL: getGoogleCallbackURL(),
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const fullName = profile.displayName || profile.name?.givenName || "User";
        const googleId = profile.id;

        if (!email) {
            return done(new Error("No email found in Google profile"), null);
        }

        let user = await userModel.findOne({ email });
        if (!user) {
            user = await userModel.create({
                email,
                fullName,
                googleId,
                role: "buyer",
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

// Routes
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";

app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);

app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

export default app;
