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
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
}));

// Passport Setup
app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID_PLACEHOLDER",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET_PLACEHOLDER",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
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

app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);

app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

export default app;
