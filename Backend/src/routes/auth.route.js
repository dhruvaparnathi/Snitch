import express from "express";
import { registerValidation, loginValidation, validate } from "../validators/auth.validator.js";
import { registerController, loginController } from "../controllers/auth.controller.js";

const authRoute = express.Router();

authRoute.post("/register", registerValidation, validate, registerController);

authRoute.post("/login", loginValidation, validate, loginController);

export default authRoute;