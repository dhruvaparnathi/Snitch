import { body, validationResult } from "express-validator";
import userModel from "../models/user.model.js";

export const registerValidation = [
    body("email").isEmail().withMessage("Invalid email address"),
    body("mobile").isMobilePhone().withMessage("Invalid mobile number"),
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("role").isIn(["buyer", "seller"]).withMessage("Invalid role"),
];

export const loginValidation = [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];