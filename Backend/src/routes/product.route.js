import express from "express";
import { createProductValidation, validate } from "../validators/product.validator.js";
import { createProductController } from "../controllers/product.controller.js";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import multer from "multer";

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const productRoute = express.Router();

productRoute.post("/create", upload.array("images", 7), authenticateSeller, createProductValidation, validate, createProductController);

export default productRoute;