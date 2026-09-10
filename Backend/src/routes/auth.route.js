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
authRoute.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRoute.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${config.FRONTEND_URL}/login` }),
    googleCallbackController
);

export default authRoute;