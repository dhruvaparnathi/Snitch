import express from "express";
import passport from "passport";
import { validate } from "../validators/validate.js";
import { registerValidation, loginValidation } from "../validators/auth.validator.js";
import { getMeController, registerController, loginController, googleCallbackController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import config from "../config/config.js";
const authRoute = express.Router();

// Public routes
authRoute.get('/me', getMeController);
authRoute.post("/register", registerValidation, validate, registerController);
authRoute.post("/login", loginValidation, validate, loginController);

// Google OAuth routes
authRoute.get("/google", (req, res, next) => {
    const returnTo = req.query.returnTo || req.headers.referer || config.FRONTEND_URL || "http://localhost:5173";
    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: returnTo
    })(req, res, next);
});

authRoute.get(
    "/google/callback",
    (req, res, next) => {
        const returnTo = req.query.state || config.FRONTEND_URL || "http://localhost:5173";
        passport.authenticate("google", {
            session: false,
            failureRedirect: `${String(returnTo).replace(/\/$/, '')}/login?error=GoogleAuthFailed`
        })(req, res, next);
    },
    googleCallbackController
);

export default authRoute;