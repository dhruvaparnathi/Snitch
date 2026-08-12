import { body, validationResult } from "express-validator";
import productModel from "../models/product.model.js";

export const createProductValidation = [
    body("name").notEmpty().withMessage("Name is required"),
    body("priceAmount").isNumeric().withMessage("Price amount is required"),
    body("priceCurrency").isIn(["INR", "USD", "EUR", "GBP", "JPY", "CAD"]).withMessage("Invalid currency"),
    body("stockQuantity").isNumeric().withMessage("Stock is required"),
];

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};