import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/validate.js";
import { addToCartValidator } from "../validators/cart.validator.js";
import { addToCartController, getCartController } from "../controllers/cart.controller.js";

const cartRouter = express.Router();

cartRouter.post("/add/:productId/:variantId", authMiddleware, addToCartValidator, validate, addToCartController);

cartRouter.get("/", authMiddleware, getCartController);

export default cartRouter;