import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export const createProductController = async (req, res, next) => {
    try {
        const { name, description, priceAmount, priceCurrency, stockQuantity } = req.body;
        const seller = req.user;
        if (!name || !description || !priceAmount ) {
            return res.status(400).json({ message: "All fields are required" });
        }
        console.log(req.files);

        const images = await Promise.all(
            req.files.map(file => uploadFile({ buffer: file.buffer, fileName: file.originalname }))
        )

        const formattedImages = images.map(img => ({
            url: img.url || img.toString(),
            alt: name || "Product image"
        }));

        const product = await productModel.create({
            title: name,
            description,
            price: {
                amount: priceAmount,
                currency: priceCurrency || "INR",
            },
            stock: stockQuantity,
            images: formattedImages,
            Images: formattedImages,
            seller: seller._id,
        });

        return res.status(200).json({ message: "Product created successfully", product });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const getAllProductController = async (req, res, next) => {
    try {
        const products = await productModel.find().populate("seller", "username");
        if (!products) {
            return res.status(404).json({ message: "Products not found" });
        }
        return res.status(200).json({ message: "Products fetched successfully", products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getSellerProductsController = async (req, res, next) => {
    try {
        const seller = req.user;
        const products = await productModel.find({ seller: seller._id });
        if (!products) {
            return res.status(404).json({ message: "No Products to Show" });
        }
        return res.status(200).json({ message: "Products fetched successfully", products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getSingleProductController = async (req, res, next) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ message: "Product fetched successfully", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}