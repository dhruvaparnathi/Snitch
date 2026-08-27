import { body, validationResult } from "express-validator";

export const addToCartValidator = [
    body("productId").notEmpty().withMessage("Product ID is required").isMongoId(),
    body("variantId").notEmpty().withMessage("Variant ID is required").isMongoId(),
    body("quantity").notEmpty().withMessage("Quantity is required").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];
