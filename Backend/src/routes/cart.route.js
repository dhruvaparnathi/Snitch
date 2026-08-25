import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { addToCartValidator } from "../validators/cart.validator.js";
import { addToCartController } from "../controllers/cart.controller.js";

const cartRouter = express.Router();

cartRouter.post("/add/:productId/:variantId", authMiddleware, addToCartValidator, addToCartController);

cartRouter.get("/get", authMiddleware, getCartController);

export default cartRouter;