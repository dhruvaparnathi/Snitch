import mongoose from "mongoose";
import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export const createProductController = async (req, res, next) => {
    try {
        const { name, description, category, priceAmount, priceCurrency, stockQuantity, variants } = req.body;
        const seller = req.user;
        if (!name || !description || !priceAmount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const galleryFiles = (req.files || []).filter(f => f.fieldname === "images" || !f.fieldname.startsWith("variant_image_"));
        const variantFilesMap = {};
        (req.files || []).forEach(f => {
            if (f.fieldname && f.fieldname.startsWith("variant_image_")) {
                const idxStr = f.fieldname.replace("variant_image_", "");
                variantFilesMap[idxStr] = f;
            }
        });

        let formattedImages = [];
        if (galleryFiles.length > 0) {
            const images = await Promise.all(
                galleryFiles.map(file => uploadFile({ buffer: file.buffer, fileName: file.originalname }))
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
                    parsedVariants = await Promise.all(rawVariants.map(async (v, vIdx) => {
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

                        let variantImgUrl = v.previewUrl && !v.previewUrl.startsWith("blob:")
                            ? v.previewUrl
                            : (v.image && typeof v.image === "string" && !v.image.startsWith("blob:") ? v.image : null);

                        const varFile = variantFilesMap[String(vIdx)] || variantFilesMap[vIdx];
                        if (varFile) {
                            const uploadedVarImg = await uploadFile({ buffer: varFile.buffer, fileName: varFile.originalname });
                            if (uploadedVarImg) {
                                variantImgUrl = uploadedVarImg.url || uploadedVarImg.toString();
                            }
                        }

                        const validId = (v._id && mongoose.isValidObjectId(v._id)) ? v._id : new mongoose.Types.ObjectId();

                        return {
                            _id: validId,
                            stock: v.stock !== undefined ? Number(v.stock) : 0,
                            attributes: attrMap,
                            prices: {
                                amount: v.priceAmount !== undefined && v.priceAmount !== "" ? Number(v.priceAmount) : Number(priceAmount),
                                currency: v.priceCurrency || priceCurrency || "INR"
                            },
                            images: variantImgUrl ? [{ url: variantImgUrl, alt: "Variant image" }] : []
                        };
                    }));
                }
            } catch (e) {
                console.warn("Could not parse variants:", e);
            }
        }

        const product = await productModel.create({
            title: name,
            description,
            category: category || "Living Units",
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

export const updateProductController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, category, priceAmount, priceCurrency, stockQuantity, variants, existingImages } = req.body;
        const seller = req.user;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        // Verify seller ownership
        if (product.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: You can only edit your own products", success: false });
        }

        // Update core fields if provided
        if (name) product.title = name;
        if (description) product.description = description;
        if (category) product.category = category;
        if (priceAmount !== undefined && priceAmount !== "") {
            product.price = {
                amount: Number(priceAmount),
                currency: priceCurrency || product.price?.currency || "INR"
            };
        }
        if (stockQuantity !== undefined && stockQuantity !== "") {
            product.stock = Number(stockQuantity);
        }

        // Process existing preserved images
        let preservedImages = [];
        if (existingImages) {
            try {
                const parsedExisting = typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages;
                if (Array.isArray(parsedExisting)) {
                    preservedImages = parsedExisting.map((img) => ({
                        url: typeof img === "string" ? img : img.url,
                        alt: (typeof img === "object" && img.alt) || product.title || "Product image"
                    })).filter(img => img.url && !img.url.startsWith("blob:"));
                }
            } catch (e) {
                console.warn("Could not parse existingImages:", e);
            }
        }

        // If no existingImages specified, keep existing product images if no new files were uploaded
        if (preservedImages.length === 0 && (!existingImages || existingImages === "[]")) {
            if (product.Images && product.Images.length > 0 && (!req.files || req.files.length === 0)) {
                preservedImages = product.Images;
            } else if (product.images && product.images.length > 0 && (!req.files || req.files.length === 0)) {
                preservedImages = product.images;
            }
        }

        const galleryFiles = (req.files || []).filter(f => f.fieldname === "images" || !f.fieldname.startsWith("variant_image_"));
        const variantFilesMap = {};
        (req.files || []).forEach(f => {
            if (f.fieldname && f.fieldname.startsWith("variant_image_")) {
                const idxStr = f.fieldname.replace("variant_image_", "");
                variantFilesMap[idxStr] = f;
            }
        });

        // Process newly uploaded gallery images
        let newUploadedImages = [];
        if (galleryFiles.length > 0) {
            const uploaded = await Promise.all(
                galleryFiles.map(file => uploadFile({ buffer: file.buffer, fileName: file.originalname }))
            );
            newUploadedImages = uploaded.map(img => ({
                url: img.url || img.toString(),
                alt: product.title || "Product image"
            }));
        }

        const combinedImages = [...preservedImages, ...newUploadedImages];
        if (combinedImages.length > 0) {
            product.Images = combinedImages;
            product.images = combinedImages;
            product.markModified("Images");
            product.markModified("images");
        }

        // Process Variants
        if (variants !== undefined) {
            let parsedVariants = [];
            try {
                const rawVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
                if (Array.isArray(rawVariants)) {
                    parsedVariants = await Promise.all(rawVariants.map(async (v, vIdx) => {
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

                        let variantImgUrl = v.previewUrl && !v.previewUrl.startsWith("blob:")
                            ? v.previewUrl
                            : (v.image && typeof v.image === "string" && !v.image.startsWith("blob:") ? v.image : null);

                        const varFile = variantFilesMap[String(vIdx)] || variantFilesMap[vIdx];
                        if (varFile) {
                            const uploadedVarImg = await uploadFile({ buffer: varFile.buffer, fileName: varFile.originalname });
                            if (uploadedVarImg) {
                                variantImgUrl = uploadedVarImg.url || uploadedVarImg.toString();
                            }
                        }

                        const validId = (v._id && mongoose.isValidObjectId(v._id)) ? v._id : ((v.id && mongoose.isValidObjectId(v.id)) ? v.id : new mongoose.Types.ObjectId());

                        return {
                            _id: validId,
                            stock: v.stock !== undefined ? Number(v.stock) : 0,
                            attributes: attrMap,
                            prices: {
                                amount: v.priceAmount !== undefined && v.priceAmount !== "" ? Number(v.priceAmount) : Number(product.price?.amount || 0),
                                currency: v.priceCurrency || priceCurrency || product.price?.currency || "INR"
                            },
                            images: variantImgUrl ? [{ url: variantImgUrl, alt: "Variant image" }] : []
                        };
                    }));
                }
            } catch (e) {
                console.warn("Could not parse updated variants:", e);
            }
            product.variants = parsedVariants;
            product.markModified("variants");
        }

        await product.save();

        return res.status(200).json({
            message: "Product updated successfully",
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const deleteProductController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const seller = req.user;

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        // Verify seller ownership
        if (product.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: You can only delete your own products", success: false });
        }

        await productModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Product removed from selling catalog successfully",
            success: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
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