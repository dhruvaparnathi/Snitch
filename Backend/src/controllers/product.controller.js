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

        const product = await productModel.create({
            title: name,
            description,
            price: {
                amount: priceAmount,
                currency: priceCurrency || "INR",
            },
            stock:stockQuantity,
            images,
            seller: seller._id,
        });

        res.status(200).json({ message: "Product created successfully", product });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
