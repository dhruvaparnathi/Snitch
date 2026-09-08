import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { addToCartController, createCartOrderController, getCartController, removeFromCartController,verifyCartOrderController } from "../controllers/cart.controller.js";

const cartRouter = express.Router();

cartRouter.post("/add/:productId/:variantId", authMiddleware, addToCartController);
cartRouter.post("/add/:productId", authMiddleware, addToCartController);
cartRouter.delete("/item/:itemId", authMiddleware, removeFromCartController);
cartRouter.delete("/remove/:productId/:variantId", authMiddleware, removeFromCartController);
cartRouter.delete("/remove/:productId", authMiddleware, removeFromCartController);
cartRouter.get("/", authMiddleware, getCartController);

cartRouter.post("/payment/order/create", authMiddleware, createCartOrderController);
cartRouter.post("/payment/order/verify", authMiddleware, verifyCartOrderController);

export default cartRouter;