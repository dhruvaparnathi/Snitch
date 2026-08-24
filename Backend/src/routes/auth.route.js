import express from "express";
import passport from "passport";
import { registerValidation, loginValidation, validate } from "../validators/auth.validator.js";
import { getMeController, registerController, loginController, googleCallbackController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRoute = express.Router();

// Public routes
authRoute.get('/me', getMeController);
authRoute.post("/register", registerValidation, validate, registerController);
authRoute.post("/login", loginValidation, validate, loginController);

// Google OAuth routes
authRoute.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRoute.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5174/login" }),
    googleCallbackController
);

export default authRoute;