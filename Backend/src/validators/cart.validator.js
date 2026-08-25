import { body, validationResult } from "express-validator";
import cartModel from "../models/cart.model.js";
import { resClient } from "../utils/apiResponse.js";

export const addToCartValidation = [
    body("productId").notEmpty().withMessage("Product ID is required").isMongoId(),
    body("variantId").notEmpty().withMessage("Variant ID is required").isMongoId(),
    body("quantity").notEmpty().withMessage("Quantity is required").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

export const addToCartValidator = [addToCartValidation, validate];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resClient(res, {
            success: false,
            status: 422,
            message: "Validation error",
            errors: errors.array()
        });
    }
    next();
};