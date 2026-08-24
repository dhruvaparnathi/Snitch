import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export const createProductController = async (req, res, next) => {
    try {
        const { name, description, priceAmount, priceCurrency, stockQuantity, variants } = req.body;
        const seller = req.user;
        if (!name || !description || !priceAmount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let formattedImages = [];
        if (req.files && req.files.length > 0) {
            const images = await Promise.all(
                req.files.map(file => uploadFile({ buffer: file.buffer, fileName: file.originalname }))
            );

            formattedImages = images.map(img => ({
                url: img.url || img.toString(),
                alt: name || "Product image"
            }));
        }

        let parsedVariants = [];
        if (variants) {
            try {
                const rawVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
                if (Array.isArray(rawVariants)) {
                    parsedVariants = rawVariants.map((v) => {
                        const attrMap = {};
                        if (Array.isArray(v.attributes)) {
                            v.attributes.forEach((attr) => {
                                if (attr.key && attr.val) {
                                    attrMap[attr.key] = attr.val;
                                }
                            });
                        } else if (v.attributes && typeof v.attributes === "object") {
                            Object.assign(attrMap, v.attributes);
                        }

                        return {
                            stock: v.stock !== undefined ? Number(v.stock) : 0,
                            attributes: attrMap,
                            prices: {
                                amount: v.priceAmount !== undefined && v.priceAmount !== "" ? Number(v.priceAmount) : Number(priceAmount),
                                currency: v.priceCurrency || priceCurrency || "INR"
                            },
                            images: v.previewUrl ? [{ url: v.previewUrl, alt: "Variant image" }] : []
                        };
                    });
                }
            } catch (e) {
                console.warn("Could not parse variants:", e);
            }
        }

        const product = await productModel.create({
            title: name,
            description,
            price: {
                amount: Number(priceAmount),
                currency: priceCurrency || "INR",
            },
            stock: Number(stockQuantity) || 1,
            images: formattedImages,
            Images: formattedImages,
            variants: parsedVariants,
            seller: seller._id,
        });

        return res.status(200).json({ message: "Product created successfully", product });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
};

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
};

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
};