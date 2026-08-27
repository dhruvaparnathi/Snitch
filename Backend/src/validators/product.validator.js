import { body, validationResult } from "express-validator";
import productModel from "../models/product.model.js";

export const createProductValidation = [
    body("name").notEmpty().withMessage("Name is required"),
    body("priceAmount").isNumeric().withMessage("Price amount is required"),
    body("priceCurrency").isIn(["INR", "USD", "EUR", "GBP", "JPY", "CAD"]).withMessage("Invalid currency"),
    body("stockQuantity").isNumeric().withMessage("Stock is required"),
    body("images").custom((value, { req }) => {
        if (!req.files || req.files.length === 0) {
            throw new Error("Images are required");
        }
        return true;
    }),
];
